// limites de requisições por IP, para barrar ataques de força bruta (tentar milhares de senhas)
const rateLimit = require('express-rate-limit');

function criarLimitador(minutos, limite, mensagem, opcoes = {}) {
    return rateLimit({
        windowMs: minutos * 60 * 1000,
        limit: limite,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { mensagem },
        ...opcoes
    });
}

//limite geral da API (folgado, para não atrapalhar quem joga normalmente)
exports.limitadorGeral = criarLimitador(
    15, 1000,
    'Muitas requisições. Aguarde alguns minutos e tente de novo.'
);

//login: no máximo 10 tentativas ERRADAS a cada 15 minutos. Login correto não conta.
exports.limitadorLogin = criarLimitador(
    15, 10,
    'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
    { skipSuccessfulRequests: true }
);

//cadastro: evita criação de contas em massa
exports.limitadorCadastro = criarLimitador(
    60, 10,
    'Muitos cadastros feitos a partir deste dispositivo. Tente novamente mais tarde.'
);
