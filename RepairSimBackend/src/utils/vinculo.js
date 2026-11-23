// Descobre o PAPEL do usuário a partir do e-mail dele (sempre consultando o banco, a cada requisição).
//   - e-mail de um domínio "aluno"      (tabela dominio_institucional)           -> 'aluno'
//   - e-mail de um domínio "professor" E promovido por você (usuario.professor)  -> 'admin'
//   - qualquer outro e-mail                                                      -> null (joga só os casos normais)
// O domínio SÓ dá o direito de participar. Ninguém vira ADM só por ter o e-mail certo:
// quem promove é você, com o script scripts/promover_adm.js.
const conexao = require('../config/db');

const db = conexao.promise();

//devolve o texto depois do ÚLTIMO "@", em minúsculo (assim "x@aluno.cps.sp.gov.br.golpe.com" não passa)
function dominioDoEmail(email) {
    const texto = String(email || '').trim().toLowerCase();
    const posicao = texto.lastIndexOf('@');

    return posicao === -1 ? '' : texto.slice(posicao + 1);
}

//devolve { id_usuario, papel } ou null (sem papel institucional)
async function buscarVinculo(idUsuario) {
    const [usuarios] = await db.query(
        'select id_usuario, email, professor from usuario where id_usuario = ?',
        [idUsuario]
    );

    if (usuarios.length === 0) {
        return null;
    }

    const [dominios] = await db.query(
        'select papel from dominio_institucional where dominio = ?',
        [dominioDoEmail(usuarios[0].email)]
    );

    if (dominios.length === 0) {
        return null;
    }

    if (dominios[0].papel === 'aluno') {
        return { id_usuario: idUsuario, papel: 'aluno' };
    }

    //domínio de professor só vira ADM se você promoveu esta conta
    if (dominios[0].papel === 'professor' && usuarios[0].professor) {
        return { id_usuario: idUsuario, papel: 'admin' };
    }

    return null;
}

//o que o front recebe (ele só usa para mostrar ou esconder botões; quem protege é o servidor)
function vinculoParaFront(vinculo) {
    return { papel: vinculo ? vinculo.papel : null };
}

module.exports = { dominioDoEmail, buscarVinculo, vinculoParaFront };
