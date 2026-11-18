const conexao = require('../config/db');
const { z } = require('zod');

// Lista os relatórios do usuário logado
exports.listar = (req, res) => {
    const sql = `select * from relatorio where id_usuario = ?`; //só os do usuário logado

    conexao.query(sql, [req.usuario.id], (erro, resultado) =>{
        if (erro) {
            console.error('Erro ao listar relatórios:', erro);
            return res.status(500).json({
                mensagem: 'Erro ao listar relatório.'
            });
        }
        res.json(resultado);
    });
};

//buscar os dados necessario para montar o relatório
exports.buscarDados = (req, res) => {
    const idDesafio = req.params.id;

    const sql = `select id_desafio, titulo, cliente, problema_relatorio, diagnostico_relatorio 
        from desafios where id_desafio = ?`;
    
    conexao.query(sql, [idDesafio], (erro, resultado) =>{
        if (erro) {
            console.error('Erro ao buscar dados do relatório:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar dados do relatório.'
            });
        }
        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: 'Desafio não encontrado.'
            });
        }
        res.json(resultado[0]);
    });
};

//molde dos dados enviados ao avaliar. O id do usuário NÃO vem do front, vem do cookie de login
const avaliarSchema = z.object({
    id_desafio: z.coerce.number().int().positive(),
    itens: z.array(z.coerce.number().int().positive()).max(50)
});

//salva o relatório e os seus itens dentro de uma transação (se um insert falhar, o outro é desfeito)
async function salvarRelatorio(idUsuario, idDesafio, acertouTudo, idsSelecionados, idsCorretos) {
    const ligacao = await conexao.promise().getConnection(); //uma conexão só para esta transação

    try {
        await ligacao.beginTransaction();

        const [relatorio] = await ligacao.query(
            'insert into relatorio (id_usuario, id_desafio, relatorio_correto) values (?, ?, ?)',
            [idUsuario, idDesafio, acertouTudo]
        );

        const valores = idsSelecionados.map(id => [relatorio.insertId, id, idsCorretos.includes(id)]);

        await ligacao.query(
            'insert into relatorio_itens (id_relatorio, id_item, correto) values ?',
            [valores]
        );

        await ligacao.commit();
    } catch (erro) {
        await ligacao.rollback();
        throw erro;
    } finally {
        ligacao.release(); //devolve a conexão para o pool
    }
}

//avalia o relatorio
//quem está logado tem o relatório salvo no banco. Quem joga sem conta é avaliado normalmente, mas nada é salvo
exports.avaliar = (req, res) =>{
    const validacao = avaliarSchema.safeParse(req.body);

    //validando
    if (!validacao.success) {
        return res.status(400).json({
            mensagem: 'Dados do relatório inválidos.'
        });
    }

    const idDesafio = validacao.data.id_desafio;
    const idsSelecionados = [...new Set(validacao.data.itens)]; //remove ids repetidos
    const idUsuario = req.usuario ? req.usuario.id : null; //null = jogando sem login

    //buscando os intens corretos do desafio pelo inner join
    const sqlCorretos = `select i.id_item, i.nome, i.tipo 
        from desafio_itens di inner join itens i on di.id_item = i.id_item where di.id_desafio = ?`;
    
    conexao.query(sqlCorretos, [idDesafio], (erro, itensCorretos) => {
        if (erro) {
            console.error('Erro ao buscar itens corretos:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar itens corretos.'
            });
        }

        if (itensCorretos.length === 0) {
            return res.status(404).json({
                mensagem: 'Desafio não encontrado.'
            });
        }

        //transforma em ids para comparar
        const idsCorretos = itensCorretos.map(
            item => Number(item.id_item)
        );

        //itens corretos que o jogador acertou
        const acertos = idsSelecionados.filter(
            id => idsCorretos.includes(id)
        );

        //itens errados que o jogador adicionou
        const erros = idsSelecionados.filter(
            id => !idsCorretos.includes(id)
        );

        //itens corretos que o jogador esqueceu
        const esquecidos = idsCorretos.filter(
            id => !idsSelecionados.includes(id)
        );

        //cenario 1, acertou tudo
        const acertouTudo = erros.length === 0 && esquecidos.length === 0;

        //cenario 2: acertou alguns, mas errou outros
        const acertouParte = acertos.length > 0 && !acertouTudo;

        //cenario 3, errou tudo
        const errouTudo = acertos.length === 0;

        //conveter ids para objetos
        const acertosDetalhes = itensCorretos.filter(
            item => acertos.includes(Number(item.id_item))
        )

        const erroDetalhes = idsSelecionados.filter(id => erros.includes(id));
        
        const esquecidosDetalhes = itensCorretos.filter(item => esquecidos.includes(Number(item.id_item)));

        //enviando a resposta para o front
        function enviarResposta(){
            if (acertouTudo){
                return res.json({
                    correto: true, erros: 0,tipo: 'completo', 
                    mensagem: 'Parabéns! Você registrou corretamente todos os itens utilizados.', 
                    itensCorretos: acertosDetalhes, itensIncorretos: [], itensEsquecidos: []
                });
            }

            if (errouTudo) {
                return res.json({
                    correto: false, erros: erros.length,tipo: 'totalmente_incorreto',
                    mensagem: 'Você não selecionou nenhum dos itens corretos.',
                    itensCorretos: itensCorretos, itensIncorretos: idsSelecionados, itensEsquecidos: esquecidosDetalhes
                });
            }

            if (acertouParte) {
                return res.json({
                    correto: false, erros: erros.length,tipo: 'parcial',
                    mensagem: 'Você acertou parte do relatório, mas selecionou itens incorretos ou deixou itens corretos de fora.',
                    itensCorretos: acertosDetalhes, itensIncorretos: erroDetalhes, itensEsquecidos: esquecidosDetalhes
                });
            }
        }

        //sem login OU sem nenhum item marcado: avalia, mas não salva nada no banco
        //(um relatório vazio não é um laudo de verdade e só serviria para espiar o gabarito)
        if (!idUsuario || idsSelecionados.length === 0) {
            return enviarResposta();
        }

        //grava o relatório e os itens numa TRANSAÇÃO: ou grava tudo ou não grava nada (sem relatório órfão)
        salvarRelatorio(idUsuario, idDesafio, acertouTudo, idsSelecionados, idsCorretos)
            .then(() => enviarResposta())
            .catch((erroSalvar) => {
                console.error('Erro ao salvar relatório: ', erroSalvar);
                res.status(500).json({
                    mensagem: 'Erro ao salvar relatório.'
                });
            });
    });
}