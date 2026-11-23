// middlewares que decidem O QUE o usuário logado pode fazer, conforme o papel dele (aluno ou admin/professor).
// o papel vem do e-mail (ver utils/vinculo.js). Devem vir DEPOIS do middleware "autenticar" (que preenche req.usuario).
const conexao = require('../config/db');
const { buscarVinculo } = require('../utils/vinculo');
const { alunoPodeJogarCaso } = require('../utils/partida');

const db = conexao.promise();

//exige que o usuário tenha e-mail institucional (aluno ou professor ADM). Preenche req.vinculo
exports.exigirMembro = async (req, res, next) => {
    try {
        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo) {
            return res.status(403).json({
                mensagem: 'Os casos exclusivos são só para quem tem e-mail institucional.'
            });
        }

        req.vinculo = vinculo;
        next();
    } catch (erro) {
        console.error('Erro ao verificar o papel do usuário:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

//exige que o usuário seja professor ADM (e-mail de professor + promovido por você). Preenche req.vinculo
exports.exigirAdmin = async (req, res, next) => {
    try {
        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo || vinculo.papel !== 'admin') {
            return res.status(403).json({
                mensagem: 'Apenas professores autorizados podem fazer isso.'
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
// - desafio padrão (origem_problema nula): passa, como sempre foi (inclusive para quem joga sem login)
// - desafio exclusivo: passa só
//     * o professor DONO do caso (criado_por), ou
//     * o aluno que tem uma PARTIDA em andamento (até 2 horas) com este caso sorteado para ele
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
            'select criado_por, origem_problema, removido from desafios where id_desafio = ?',
            [idDesafio]
        );

        if (desafios.length === 0) {
            return next();
        }

        const desafio = desafios[0];

        //caso padrão do jogo (só os exclusivos têm origem_problema preenchida)
        if (desafio.origem_problema === null) {
            return next();
        }

        const naoEncontrado = () => res.status(404).json({ mensagem: 'Desafio não encontrado.' });

        //caso REMOVIDO = inexistente. Caso apenas DESATIVADO continua acessível (quem já está jogando termina o caso)
        if (desafio.removido || !req.usuario) {
            return naoEncontrado();
        }

        const vinculo = await buscarVinculo(req.usuario.id);

        if (!vinculo) {
            return naoEncontrado();
        }

        //professor dono do caso (testes dele)
        if (vinculo.papel === 'admin') {
            if (desafio.criado_por === req.usuario.id) {
                req.vinculo = vinculo;
                return next();
            }

            return naoEncontrado();
        }

        //aluno: só se o caso foi sorteado para uma partida dele que está em andamento
        const idPartida = await alunoPodeJogarCaso(req.usuario.id, idDesafio);

        if (!idPartida) {
            return naoEncontrado();
        }

        req.vinculo = vinculo;
        next();
    } catch (erro) {
        console.error('Erro ao verificar acesso ao desafio:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
