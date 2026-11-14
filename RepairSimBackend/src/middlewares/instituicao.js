// middlewares que decidem O QUE o usuário logado pode fazer, conforme a instituição e o papel dele.
// devem vir DEPOIS do middleware "autenticar" (que preenche req.usuario).
const conexao = require('../config/db');
const { buscarVinculo } = require('../utils/vinculo');

const db = conexao.promise();

//exige que o usuário faça parte de uma instituição ativa (aluno ou admin). Preenche req.vinculo
exports.exigirMembro = async (req, res, next) => {
    try {
        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo) {
            return res.status(403).json({
                mensagem: 'Você precisa fazer parte de uma instituição ativa para acessar os casos exclusivos.'
            });
        }

        req.vinculo = vinculo;
        next();
    } catch (erro) {
        console.error('Erro ao verificar instituição:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

//exige que o usuário seja ADM de uma instituição ativa. Preenche req.vinculo
exports.exigirAdmin = async (req, res, next) => {
    try {
        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo || vinculo.papel !== 'admin') {
            return res.status(403).json({
                mensagem: 'Apenas administradores de uma instituição ativa podem fazer isso.'
            });
        }

        req.vinculo = vinculo;
        next();
    } catch (erro) {
        console.error('Erro ao verificar administrador:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

// protege as rotas que já existiam e recebem o id de um desafio (verificar, imagens, relatório...).
// - desafio padrão (id_instituicao nulo): passa, como sempre foi (inclusive para quem joga sem login)
// - desafio exclusivo: só passa quem está logado E é da mesma instituição do desafio
// para quem não pode, respondemos 404 (e não 403) para não revelar que o caso existe.
// "extrairId" diz onde está o id: (req) => req.params.id   ou   (req) => req.body.id_desafio
// deve vir DEPOIS de "autenticarOpcional".
exports.exigirAcessoDesafio = (extrairId) => async (req, res, next) => {
    const idDesafio = Number(extrairId(req));

    //id inválido ou inexistente: deixa o controller responder (400/404) do jeito que já fazia
    if (!Number.isInteger(idDesafio) || idDesafio <= 0) {
        return next();
    }

    try {
        const [desafios] = await db.query(
            'select id_instituicao, ativo from desafios where id_desafio = ?',
            [idDesafio]
        );

        if (desafios.length === 0) {
            return next();
        }

        const desafio = desafios[0];

        //caso padrão do jogo
        if (desafio.id_instituicao === null) {
            return next();
        }

        const naoEncontrado = () => res.status(404).json({ mensagem: 'Desafio não encontrado.' });

        if (!desafio.ativo || !req.usuario) {
            return naoEncontrado();
        }

        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo || vinculo.id_instituicao !== desafio.id_instituicao) {
            return naoEncontrado();
        }

        req.vinculo = vinculo;
        next();
    } catch (erro) {
        console.error('Erro ao verificar acesso ao desafio:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
