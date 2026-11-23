// casos EXCLUSIVOS do professor: cadastro (ADM), listagem, ativar/desativar, remover (ADM) e sorteio para jogar (aluno em sala, ou professor testando).
// Cada caso pertence ao PROFESSOR que o criou (criado_por): um professor nunca vê nem mexe nos casos de outro.
// Versão demo: apenas casos de 1 etapa (uma única ação/item como resposta).
const conexao = require('../config/db');
const { z } = require('zod');
const { CAMPOS_OBRIGATORIOS, CAMPOS_OPCIONAIS } = require('../middlewares/upload');
const { detectarExtensao, salvarImagem, removerArquivos } = require('../utils/imagens');
const { interromperPartidasDoAluno, expirarPartidasVencidas } = require('../utils/partida');

const db = conexao.promise();

//casos exclusivos de 1 etapa seguem o padrão dos casos fáceis do jogo
const DIFICULDADE_EXCLUSIVO = 'Facil';
const PONTOS_BASE_EXCLUSIVO = 100;
const QUANTIDADE_POR_JOGATINA = 10;

//a 5ª imagem (a do problema) é obrigatória? Hoje: opcional. Para exigir, troque para true
const IMAGEM_PROBLEMA_OBRIGATORIA = false;

//molde dos campos de texto do formulário. O id da instituição e o autor NÃO vêm daqui: vêm da sessão (req.vinculo / req.usuario)
const criarSchema = z.object({
    titulo: z.string().trim().min(3, 'O título deve ter no mínimo 3 caracteres.').max(80, 'O título não pode passar de 80 caracteres.'),
    cliente: z.string().trim().min(2, 'Informe o nome do cliente.').max(100, 'O nome do cliente não pode passar de 100 caracteres.'),
    descricao: z.string().trim().min(10, 'A descrição do cliente deve ter no mínimo 10 caracteres.').max(255, 'A descrição do cliente não pode passar de 255 caracteres.'),
    problema_relatorio: z.string().trim().min(5, 'Informe o problema do relatório.').max(1000, 'O problema do relatório é grande demais.'),
    diagnostico_relatorio: z.string().trim().min(5, 'Informe o diagnóstico do relatório.').max(1000, 'O diagnóstico do relatório é grande demais.'),
    dica: z.string().trim().max(255, 'A dica não pode passar de 255 caracteres.').optional(),
    origem_problema: z.enum(['hardware', 'software'], 'A origem do problema deve ser hardware ou software.'),
    id_item_resposta: z.coerce.number('Escolha o item da resposta correta.').int().positive('Escolha o item da resposta correta.')
});

//a imagem do problema vira uma "funcao" diferente conforme a origem. Como é UM campo só, o caso nunca
//tem problema no monitor E no gabinete ao mesmo tempo.
//ATENÇÃO: o nome do hardware termina em "_defeito" de propósito: é assim que o caso.jsx já reconhece
//o gabinete aberto com defeito (casos 2 e 5). Já o do software NÃO pode terminar em "_defeito".
const FUNCAO_IMAGEM_PROBLEMA = {
    hardware: 'gabinete_defeito', //gabinete aberto mostrando o problema
    software: 'monitor_problema'  //monitor mostrando o problema
};

const NOMES_AMIGAVEIS = {
    monitor_ligado: 'monitor ligado',
    monitor_desligado: 'monitor desligado',
    gabinete_ligado: 'gabinete ligado',
    gabinete_desligado: 'gabinete desligado',
    gabinete_limpo: 'gabinete aberto limpo',
    monitor_problema: 'monitor com problema',
    gabinete_defeito: 'gabinete aberto com problema'
};

//------------------------------------------------------------------
// POST /desafios-exclusivos   (ADM)   multipart/form-data
//------------------------------------------------------------------
exports.criar = async (req, res) => {
    const validacao = criarSchema.safeParse(req.body || {});

    if (!validacao.success) {
        const primeiro = validacao.error.issues[0];
        //campo ausente ou com tipo errado
        return res.status(400).json({
            mensagem: primeiro.code === 'invalid_type' ? 'Preencha todos os campos obrigatórios.' : primeiro.message
        });
    }

    const dados = validacao.data;
    const arquivos = req.files || {};

    //---- 1) regras das imagens (antes de gravar qualquer coisa) ----

    for (const campo of CAMPOS_OBRIGATORIOS) {
        if (!arquivos[campo]) {
            return res.status(400).json({ mensagem: `Envie a imagem: ${NOMES_AMIGAVEIS[campo]}.` });
        }
    }

    const funcaoImagemProblema = FUNCAO_IMAGEM_PROBLEMA[dados.origem_problema];

    if (IMAGEM_PROBLEMA_OBRIGATORIA && !arquivos.imagem_problema) {
        return res.status(400).json({ mensagem: `Envie a imagem: ${NOMES_AMIGAVEIS[funcaoImagemProblema]}.` });
    }

    //confere o conteúdo real de cada arquivo (não confia na extensão nem no mimetype)
    const imagensParaSalvar = []; // { funcao, buffer, extensao }

    for (const campo of [...CAMPOS_OBRIGATORIOS, ...CAMPOS_OPCIONAIS]) {
        if (!arquivos[campo]) {
            continue;
        }

        //o campo "imagem_problema" vira monitor_problema ou gabinete_defeito, conforme a origem
        const funcao = campo === 'imagem_problema' ? funcaoImagemProblema : campo;
        const buffer = arquivos[campo][0].buffer;
        const extensao = detectarExtensao(buffer);

        if (!extensao) {
            return res.status(400).json({
                mensagem: `A imagem "${NOMES_AMIGAVEIS[funcao]}" precisa ser PNG, JPG ou WEBP.`
            });
        }

        imagensParaSalvar.push({ funcao, buffer, extensao });
    }

    //---- 2) a resposta correta precisa existir e combinar com a origem do problema ----

    const arquivosGravados = []; //caminhos absolutos, para apagar se algo falhar
    let conexaoTransacao = null;

    try {
        const [itens] = await db.query('select id_item, tipo from itens where id_item = ?', [dados.id_item_resposta]);

        if (itens.length === 0) {
            return res.status(400).json({ mensagem: 'O item escolhido como resposta não existe.' });
        }

        //software -> a resposta é um item de software. hardware -> peça ou ferramenta
        const tipoItem = itens[0].tipo;
        const combina = dados.origem_problema === 'software' ? tipoItem === 'software' : tipoItem !== 'software';

        if (!combina) {
            return res.status(400).json({
                mensagem: dados.origem_problema === 'software'
                    ? 'Em um problema de software a resposta correta deve ser um item de software.'
                    : 'Em um problema de hardware a resposta correta deve ser uma peça ou uma ferramenta.'
            });
        }

        //---- 3) grava as imagens no disco ----

        const imagensGravadas = []; // { funcao, caminho }

        for (const imagem of imagensParaSalvar) {
            const gravada = await salvarImagem(imagem.buffer, imagem.extensao, req.usuario.id);
            arquivosGravados.push(gravada.arquivo);
            imagensGravadas.push({ funcao: imagem.funcao, caminho: gravada.caminho });
        }

        //---- 4) grava tudo no banco em UMA transação (ou entra tudo, ou não entra nada) ----

        conexaoTransacao = await db.getConnection();
        await conexaoTransacao.beginTransaction();

        const [resultadoDesafio] = await conexaoTransacao.query(
            `insert into desafios
                (titulo, cliente, descricao, problema_relatorio, diagnostico_relatorio, dica,
                 dificuldade, pontos_base, id_instituicao, criado_por, origem_problema)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.titulo, dados.cliente, dados.descricao, dados.problema_relatorio, dados.diagnostico_relatorio,
                dados.dica || null, DIFICULDADE_EXCLUSIVO, PONTOS_BASE_EXCLUSIVO,
                null, req.usuario.id, dados.origem_problema
            ]
        );

        const idDesafio = resultadoDesafio.insertId;

        for (const imagem of imagensGravadas) {
            const nomeImagem = `${dados.titulo} - ${NOMES_AMIGAVEIS[imagem.funcao]}`.slice(0, 80);

            const [resultadoImagem] = await conexaoTransacao.query(
                'insert into imagens_pc (nome, caminho_imagem) values (?, ?)',
                [nomeImagem, imagem.caminho]
            );

            await conexaoTransacao.query(
                'insert into desafio_imagens_pc (id_desafio, id_pc, funcao) values (?, ?, ?)',
                [idDesafio, resultadoImagem.insertId, imagem.funcao]
            );
        }

        //obs.: o gabinete aberto limpo (gabinete_limpo) agora é uma das imagens ENVIADAS no formulário e já foi gravado no laço acima.
        //Antes o servidor vinculava uma imagem genérica; isso não é mais feito.

        //resposta correta: etapa (ordem) 1, igual aos casos 1 a 7
        await conexaoTransacao.query(
            'insert into desafio_itens (id_desafio, id_item, ordem) values (?, ?, 1)',
            [idDesafio, dados.id_item_resposta]
        );

        await conexaoTransacao.commit();

        res.status(201).json({
            mensagem: 'Caso exclusivo cadastrado com sucesso!',
            id_desafio: idDesafio
        });

    } catch (erro) {
        if (conexaoTransacao) {
            try {
                await conexaoTransacao.rollback();
            } catch (erroRollback) {
                console.error('Erro ao desfazer transação:', erroRollback.message);
            }
        }

        await removerArquivos(arquivosGravados); //não deixa imagens órfãs no disco

        console.error('Erro ao cadastrar caso exclusivo:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao cadastrar o caso exclusivo.' });

    } finally {
        if (conexaoTransacao) {
            conexaoTransacao.release();
        }
    }
};

//------------------------------------------------------------------
// GET /desafios-exclusivos   (ADM): casos da instituição do ADM que NÃO foram removidos (ativos e desativados)
//------------------------------------------------------------------
exports.listar = async (req, res) => {
    try {
        const [casos] = await db.query(
            `select d.id_desafio, d.titulo, d.cliente, d.descricao, d.origem_problema, d.ativo,
                    i.id_item as id_item_resposta, i.nome as item_resposta, i.tipo as tipo_item_resposta
             from desafios d
             left join desafio_itens di on di.id_desafio = d.id_desafio and di.ordem = 1
             left join itens i on i.id_item = di.id_item
             where d.criado_por = ? and d.removido = 0
             order by d.id_desafio desc`,
            [req.usuario.id]
        );

        res.json({ casos });

    } catch (erro) {
        console.error('Erro ao listar casos exclusivos:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao listar os casos exclusivos.' });
    }
};

//------------------------------------------------------------------
// DELETE /desafios-exclusivos/:id   (ADM)
// não apaga de verdade: marca removido = 1 (o caso some do jogo e da lista, mas relatórios já feitos por alunos continuam válidos)
// REMOVER é diferente de DESATIVAR: desativar (PATCH /:id/ativo) só tira o caso do sorteio e o professor pode reativar depois
//------------------------------------------------------------------
exports.desativar = async (req, res) => {
    const idDesafio = Number(req.params.id);

    if (!Number.isInteger(idDesafio) || idDesafio <= 0) {
        return res.status(400).json({ mensagem: 'Caso inválido.' });
    }

    try {
        //o "criado_por = ?" garante que o professor só mexe nos casos que ele mesmo criou
        const [resultado] = await db.query(
            'update desafios set removido = 1, ativo = 0 where id_desafio = ? and criado_por = ? and removido = 0',
            [idDesafio, req.usuario.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Caso não encontrado.' });
        }

        res.json({ mensagem: 'Caso removido com sucesso.' });

    } catch (erro) {
        console.error('Erro ao remover caso exclusivo:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao remover o caso exclusivo.' });
    }
};

//------------------------------------------------------------------
// PATCH /desafios-exclusivos/:id/ativo   (ADM)   body: { "ativo": true | false }
// interruptor do professor: só o caso ATIVO entra no sorteio. Desativar NÃO derruba quem já está jogando esse caso
// (o acesso ao caso só é cortado quando ele é REMOVIDO).
//------------------------------------------------------------------
const ativoSchema = z.object({
    ativo: z.boolean('Informe se o caso deve ficar ativo ou desativado.')
});

exports.alternarAtivo = async (req, res) => {
    const idDesafio = Number(req.params.id);

    if (!Number.isInteger(idDesafio) || idDesafio <= 0) {
        return res.status(400).json({ mensagem: 'Caso inválido.' });
    }

    const validacao = ativoSchema.safeParse(req.body || {});

    if (!validacao.success) {
        return res.status(400).json({ mensagem: validacao.error.issues[0].message });
    }

    try {
        //o "criado_por = ?" garante que o professor só mexe nos casos que ele mesmo criou
        const [resultado] = await db.query(
            'update desafios set ativo = ? where id_desafio = ? and criado_por = ? and removido = 0',
            [validacao.data.ativo ? 1 : 0, idDesafio, req.usuario.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Caso não encontrado.' });
        }

        res.json({
            mensagem: validacao.data.ativo ? 'Caso ativado.' : 'Caso desativado.',
            ativo: validacao.data.ativo
        });

    } catch (erro) {
        console.error('Erro ao alterar o caso exclusivo:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao alterar o caso exclusivo.' });
    }
};

//------------------------------------------------------------------
// POST /desafios-exclusivos/jogar   (aluno com sala válida, ou professor ADM testando)
// responde { quantidade, desafios, id_partida, teste } (o mesmo formato do sorteio normal + id da partida)
//
//  ALUNO: precisa estar numa sala cujo código ainda vale. O servidor sorteia (para ESSE aluno) até 10 casos ATIVOS
//         do professor da sala, sem repetir, e registra a PARTIDA. Cada aluno recebe casos e ordem diferentes.
//         Uma partida anterior em andamento vira "interrompida".
//  PROFESSOR: joga os próprios casos (inclusive os desativados, para poder testar antes de ativar). Nada é salvo (teste).
//------------------------------------------------------------------
const CONDICAO_CASO_JOGAVEL = `
    and d.removido = 0
    and exists (select 1 from desafio_imagens_pc dip where dip.id_desafio = d.id_desafio)
    and exists (select 1 from desafio_itens di where di.id_desafio = d.id_desafio)`;

exports.sortearParaJogar = async (req, res) => {
    let conexaoTransacao = null;

    try {
        await expirarPartidasVencidas();

        //---- professor testando ----
        if (req.vinculo.papel === 'admin') {
            const [desafios] = await db.query(
                `select d.* from desafios d
                 where d.criado_por = ? ${CONDICAO_CASO_JOGAVEL}
                 order by rand() limit ?`,
                [req.usuario.id, QUANTIDADE_POR_JOGATINA]
            );

            if (desafios.length === 0) {
                return res.status(404).json({ mensagem: 'Você ainda não cadastrou casos para testar.' });
            }

            return res.json({ quantidade: desafios.length, desafios, id_partida: null, teste: true });
        }

        //---- aluno: precisa de uma sala com código ainda válido ----
        const [salas] = await db.query(
            `select s.id_sala, s.id_professor
             from aluno_sala a
             inner join sala s on s.id_sala = a.id_sala
             where a.id_usuario = ? and s.cancelada = 0 and s.expira_em > now()`,
            [req.usuario.id]
        );

        if (salas.length === 0) {
            return res.status(403).json({
                mensagem: 'Digite o código da sala do seu professor para começar (ele pode ter expirado).'
            });
        }

        const sala = salas[0];

        const [desafios] = await db.query(
            `select d.* from desafios d
             where d.criado_por = ? and d.ativo = 1 ${CONDICAO_CASO_JOGAVEL}
             order by rand() limit ?`,
            [sala.id_professor, QUANTIDADE_POR_JOGATINA]
        );

        if (desafios.length === 0) {
            return res.status(404).json({ mensagem: 'Seu professor ainda não tem casos ativos.' });
        }

        //---- registra a partida (e interrompe a anterior) numa transação ----
        conexaoTransacao = await db.getConnection();
        await conexaoTransacao.beginTransaction();

        await interromperPartidasDoAluno(req.usuario.id, 'nova_partida', conexaoTransacao);

        const [partida] = await conexaoTransacao.query(
            'insert into partida_sala (id_usuario, id_sala, id_professor, casos_total) values (?, ?, ?, ?)',
            [req.usuario.id, sala.id_sala, sala.id_professor, desafios.length]
        );

        for (let i = 0; i < desafios.length; i++) {
            await conexaoTransacao.query(
                'insert into partida_caso (id_partida, ordem, id_desafio) values (?, ?, ?)',
                [partida.insertId, i + 1, desafios[i].id_desafio]
            );
        }

        await conexaoTransacao.commit();

        res.json({ quantidade: desafios.length, desafios, id_partida: partida.insertId, teste: false });

    } catch (erro) {
        if (conexaoTransacao) {
            await conexaoTransacao.rollback().catch(() => {});
        }
        console.error('Erro ao sortear casos exclusivos:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar os casos exclusivos.' });
    } finally {
        if (conexaoTransacao) {
            conexaoTransacao.release();
        }
    }
};
