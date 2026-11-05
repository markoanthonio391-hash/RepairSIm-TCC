// funções de apoio para o token de login (JWT) e para o cookie que guarda esse token
const jwt = require('jsonwebtoken');

const NOME_COOKIE = 'repairsim_token';
const VALIDADE_DIAS = 7;

// opções do cookie de sessão
// httpOnly: o JavaScript do navegador NÃO consegue ler o cookie (protege contra roubo de token via XSS)
// sameSite lax: o navegador não envia o cookie em requisições vindas de outros sites (protege contra CSRF)
// secure: em produção o cookie só trafega por HTTPS
function opcoesCookie() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    };
}

// o cookie de login dura 7 dias, então o jogador continua logado mesmo fechando o navegador
function opcoesCookieLogin() {
    return { ...opcoesCookie(), maxAge: VALIDADE_DIAS * 24 * 60 * 60 * 1000 };
}

//cria o token. Dentro dele vai só o id do usuário (nunca senha ou email)
function gerarToken(usuario) {
    return jwt.sign(
        { sub: String(usuario.id_usuario) },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: `${VALIDADE_DIAS}d`, issuer: 'repairsim' }
    );
}

//confere assinatura, validade e emissor. Se algo estiver errado, lança um erro
function verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'], //aceita só HS256, impedindo ataques de troca de algoritmo
        issuer: 'repairsim'
    });
}

module.exports = { NOME_COOKIE, opcoesCookie, opcoesCookieLogin, gerarToken, verificarToken };
