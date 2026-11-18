// busca a instituição e o papel (aluno/admin) de um usuário.
// SEMPRE consulta o banco: o papel NÃO fica no token nem no localStorage do front, então se o admin for
// rebaixado (ou a instituição suspensa) o acesso cai na hora, e ninguém consegue se passar por ADM editando o navegador.
const conexao = require('../config/db');

const db = conexao.promise();

//devolve { id_instituicao, nome_instituicao, papel } ou null (sem instituição ou instituição inativa)
async function buscarVinculo(idUsuario) {
    const [linhas] = await db.query(
        `select ui.id_instituicao, i.nome as nome_instituicao, ui.papel
         from usuario_instituicao ui
         inner join instituicao i on i.id_instituicao = ui.id_instituicao
         where ui.id_usuario = ? and i.ativa = 1`,
        [idUsuario]
    );

    return linhas.length > 0 ? linhas[0] : null;
}

//formato que vai para o front (login e /me)
function vinculoParaFront(vinculo) {
    return {
        papel: vinculo ? vinculo.papel : null,
        instituicao: vinculo
            ? { id_instituicao: vinculo.id_instituicao, nome: vinculo.nome_instituicao }
            : null
    };
}

module.exports = { buscarVinculo, vinculoParaFront };
