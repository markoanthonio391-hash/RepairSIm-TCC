// Promove (ou remove) um PROFESSOR ADM. Quem dá o acesso de ADM é você, direto pelo servidor.
//
// Como usar (dentro da pasta RepairSimBackend):
//   node scripts/promover_adm.js email@professor.cps.sp.gov.br            -> vira ADM
//   node scripts/promover_adm.js email@professor.cps.sp.gov.br --remover   -> deixa de ser ADM
//
// Regras:
//   - a conta precisa existir (a pessoa se cadastra pela tela normal, assim a senha é criptografada);
//   - o e-mail precisa ser de um domínio de PROFESSOR cadastrado na tabela dominio_institucional.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const conexao = require('../src/config/db');
const { dominioDoEmail } = require('../src/utils/vinculo');

const db = conexao.promise();

async function main() {
    const email = String(process.argv[2] || '').trim().toLowerCase();
    const remover = process.argv.includes('--remover');

    if (!email || email.startsWith('--')) {
        console.log('Uso: node scripts/promover_adm.js email@professor.cps.sp.gov.br [--remover]');
        return 1;
    }

    const [dominios] = await db.query(
        "select papel from dominio_institucional where dominio = ?",
        [dominioDoEmail(email)]
    );

    if (dominios.length === 0 || dominios[0].papel !== 'professor') {
        console.log(`RECUSADO: "${email}" não é de um domínio de professor (veja a tabela dominio_institucional).`);
        return 1;
    }

    const [usuarios] = await db.query('select id_usuario, nome, professor from usuario where email = ?', [email]);

    if (usuarios.length === 0) {
        console.log(`Nenhuma conta com o e-mail ${email}. Peça para a pessoa se cadastrar primeiro pela tela de cadastro.`);
        return 1;
    }

    await db.query('update usuario set professor = ? where id_usuario = ?', [remover ? 0 : 1, usuarios[0].id_usuario]);

    console.log(remover
        ? `${usuarios[0].nome} (${email}) não é mais ADM.`
        : `${usuarios[0].nome} (${email}) agora é professor ADM.`);

    return 0;
}

main()
    .then((codigo) => { conexao.end(() => process.exit(codigo)); })
    .catch((erro) => {
        console.error('Erro:', erro.message);
        conexao.end(() => process.exit(1));
    });
