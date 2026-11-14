// middlewares que identificam QUEM está fazendo a requisição, lendo o cookie de sessão.
// o id do usuário passa a vir do token (assinado pelo servidor) e não mais do corpo da requisição,
// assim ninguém consegue se passar por outro jogador mandando um id_usuario falso.
const { NOME_COOKIE, verificarToken } = require('../utils/token');

//lê o cookie e devolve { id } ou null caso não exista / esteja inválido / expirado
function identificarUsuario(req) {
    const token = req.cookies ? req.cookies[NOME_COOKIE] : null;

    if (!token) {
        return null;
    }

    try {
        const dados = verificarToken(token);
        const id = Number(dados.sub);

        return Number.isInteger(id) && id > 0 ? { id } : null;
    } catch {
        return null;
    }
}

//exige login: sem sessão válida, responde 401
exports.autenticar = (req, res, next) => {
    const usuario = identificarUsuario(req);

    if (!usuario) {
        return res.status(401).json({
            mensagem: 'Faça login para continuar.'
        });
    }

    req.usuario = usuario;
    next();
};

//login opcional: se estiver logado preenche req.usuario, senão deixa null e segue (usado para jogar sem conta)
exports.autenticarOpcional = (req, res, next) => {
    req.usuario = identificarUsuario(req);
    next();
};
