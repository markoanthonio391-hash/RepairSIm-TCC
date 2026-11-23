// middlewares que identificam QUEM está fazendo a requisição, lendo o cookie de sessão.
// o id do usuário passa a vir do token (assinado pelo servidor) e não mais do corpo da requisição,
// assim ninguém consegue se passar por outro jogador mandando um id_usuario falso.
const { NOME_COOKIE, opcoesCookie, verificarToken } = require('../utils/token');
const conexao = require('../config/db');

const db = conexao.promise();

//lê o cookie e devolve:
//  { id }                    login válido
//  { substituida: true }     SESSÃO ÚNICA: a conta de aluno entrou em outro dispositivo depois deste
//  null                      sem login / token inválido / expirado
async function identificarUsuario(req) {
    const token = req.cookies ? req.cookies[NOME_COOKIE] : null;

    if (!token) {
        return null;
    }

    let dados;

    try {
        dados = verificarToken(token);
    } catch {
        return null;
    }

    const id = Number(dados.sub);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    //SESSÃO ÚNICA (só alunos): o "sid" do token precisa ser o mesmo que está no banco.
    //Cada novo login do aluno gera um sid novo, então o login mais antigo deixa de valer ("a última entrada vence").
    //Professores e contas sem e-mail institucional não passam por esta regra.
    const [linhas] = await db.query(
        `select u.sessao_id, d.papel
         from usuario u
         left join dominio_institucional d on d.dominio = lower(substring_index(u.email, '@', -1))
         where u.id_usuario = ?`,
        [id]
    );

    if (linhas.length === 0) {
        return null; //usuário apagado do banco
    }

    if (linhas[0].papel === 'aluno' && (!dados.sid || dados.sid !== linhas[0].sessao_id)) {
        return { substituida: true };
    }

    return { id };
}

function responderSessaoSubstituida(res) {
    res.clearCookie(NOME_COOKIE, opcoesCookie());

    return res.status(401).json({
        codigo: 'SESSAO_SUBSTITUIDA',
        mensagem: 'Sua conta entrou em outro dispositivo. Entre novamente.'
    });
}

//exige login: sem sessão válida, responde 401
exports.autenticar = async (req, res, next) => {
    try {
        const usuario = await identificarUsuario(req);

        if (usuario && usuario.substituida) {
            return responderSessaoSubstituida(res);
        }

        if (!usuario) {
            return res.status(401).json({
                mensagem: 'Faça login para continuar.'
            });
        }

        req.usuario = usuario;
        next();
    } catch (erro) {
        console.error('Erro ao identificar o usuário:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

//login opcional: se estiver logado preenche req.usuario, senão deixa null e segue (usado para jogar sem conta)
exports.autenticarOpcional = async (req, res, next) => {
    try {
        const usuario = await identificarUsuario(req);

        if (usuario && usuario.substituida) {
            return responderSessaoSubstituida(res);
        }

        req.usuario = usuario;
        next();
    } catch (erro) {
        console.error('Erro ao identificar o usuário:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
