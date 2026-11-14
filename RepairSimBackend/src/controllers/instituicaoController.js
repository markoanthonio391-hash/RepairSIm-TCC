const conexao = require('../config/db');
const { z } = require('zod');
const { buscarVinculo, vinculoParaFront } = require('../utils/vinculo');

const db = conexao.promise();

const entrarSchema = z.object({
    codigo: z.string().trim().min(3, 'Digite o código da instituição.').max(20, 'Código inválido.')
});

//o aluno digita o código de convite e passa a fazer parte da instituição (papel "aluno").
//quem vira ADM é definido por você direto no banco (ver migracao_casos_exclusivos.sql)
exports.entrar = async (req, res) => {
    const validacao = entrarSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(400).json({ mensagem: validacao.error.issues[0].message });
    }

    try {
        //já está em alguma instituição? (mesmo uma suspensa, por causa da chave primária)
        const [jaVinculado] = await db.query(
            'select id_usuario from usuario_instituicao where id_usuario = ?',
            [req.usuario.id]
        );

        if (jaVinculado.length > 0) {
            return res.status(409).json({ mensagem: 'Você já faz parte de uma instituição.' });
        }

        const [instituicoes] = await db.query(
            'select id_instituicao, nome from instituicao where codigo_convite = ? and ativa = 1',
            [validacao.data.codigo]
        );

        //mesma mensagem para "não existe" e "está inativa"
        if (instituicoes.length === 0) {
            return res.status(404).json({ mensagem: 'Código de instituição inválido.' });
        }

        await db.query(
            "insert into usuario_instituicao (id_usuario, id_instituicao, papel) values (?, ?, 'aluno')",
            [req.usuario.id, instituicoes[0].id_instituicao]
        );

        res.status(201).json({
            mensagem: `Você agora faz parte de ${instituicoes[0].nome}!`,
            papel: 'aluno',
            instituicao: { id_instituicao: instituicoes[0].id_instituicao, nome: instituicoes[0].nome }
        });

    } catch (erro) {
        //dois cliques ao mesmo tempo: a chave primária barra o segundo
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: 'Você já faz parte de uma instituição.' });
        }

        console.error('Erro ao entrar na instituição:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

//dados da instituição do usuário logado. Só o ADM recebe o código de convite (para repassar aos alunos)
exports.minha = async (req, res) => {
    try {
        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo) {
            return res.json({ papel: null, instituicao: null });
        }

        const resposta = vinculoParaFront(vinculo);

        if (vinculo.papel === 'admin') {
            const [linhas] = await db.query(
                'select codigo_convite from instituicao where id_instituicao = ?',
                [vinculo.id_instituicao]
            );

            resposta.instituicao.codigo_convite = linhas[0].codigo_convite;
        }

        res.json(resposta);

    } catch (erro) {
        console.error('Erro ao buscar instituição:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
