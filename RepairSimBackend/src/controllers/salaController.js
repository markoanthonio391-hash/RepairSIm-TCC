// SALA DE PROVA: o professor (ADM) gera um código de 6 dígitos que vale por alguns minutos.
// O aluno digita o código para poder COMEÇAR uma partida de casos exclusivos daquele professor.
// Depois que a partida começou, o código pode expirar: a partida continua válida (até 2 horas).
// O horário de expiração é sempre calculado pelo MySQL (now()), nunca pelo relógio do computador de ninguém.
const crypto = require('crypto');
const { z } = require('zod');
const conexao = require('../config/db');
const { interromperPartidasDoAluno, expirarPartidasVencidas } = require('../utils/partida');

const db = conexao.promise();

const VALIDADES_PERMITIDAS = [5, 10, 30, 60]; //minutos

const gerarSchema = z.object({
    minutos: z.number('Escolha a validade do código.').refine(
        (valor) => VALIDADES_PERMITIDAS.includes(valor),
        'Validade inválida. Use 5, 10, 30 ou 60 minutos.'
    )
});

const entrarSchema = z.object({
    codigo: z.string('Digite o código da sala.').trim().regex(/^\d{6}$/, 'O código tem 6 números.')
});

//gera um código de 6 dígitos que NÃO esteja em uso por outra sala ainda válida
async function gerarCodigoLivre() {
    for (let tentativa = 0; tentativa < 20; tentativa++) {
        const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

        const [usados] = await db.query(
            'select 1 from sala where codigo = ? and cancelada = 0 and expira_em > now() limit 1',
            [codigo]
        );

        if (usados.length === 0) {
            return codigo;
        }
    }

    throw new Error('Não foi possível gerar um código livre.');
}

//------------------------------------------------------------------
// POST /salas   (professor ADM)   body: { "minutos": 5 | 10 | 30 | 60 }
// um código novo CANCELA o anterior do mesmo professor
//------------------------------------------------------------------
exports.gerar = async (req, res) => {
    const validacao = gerarSchema.safeParse(req.body || {});

    if (!validacao.success) {
        return res.status(400).json({ mensagem: validacao.error.issues[0].message });
    }

    try {
        await db.query(
            'update sala set cancelada = 1 where id_professor = ? and cancelada = 0 and expira_em > now()',
            [req.usuario.id]
        );

        const codigo = await gerarCodigoLivre();

        const [resultado] = await db.query(
            'insert into sala (id_professor, codigo, expira_em) values (?, ?, date_add(now(), interval ? minute))',
            [req.usuario.id, codigo, validacao.data.minutos]
        );

        const [salas] = await db.query(
            'select id_sala, codigo, timestampdiff(second, now(), expira_em) as segundos_restantes from sala where id_sala = ?',
            [resultado.insertId]
        );

        res.status(201).json({ mensagem: 'Código gerado.', sala: { ...salas[0], alunos: 0 } });

    } catch (erro) {
        console.error('Erro ao gerar a sala:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao gerar o código.' });
    }
};

//------------------------------------------------------------------
// GET /salas/ativa   (professor ADM): o código que está valendo agora (ou { sala: null })
//------------------------------------------------------------------
exports.ativa = async (req, res) => {
    try {
        const [salas] = await db.query(
            `select s.id_sala, s.codigo,
                    timestampdiff(second, now(), s.expira_em) as segundos_restantes,
                    (select count(*) from aluno_sala a where a.id_sala = s.id_sala) as alunos
             from sala s
             where s.id_professor = ? and s.cancelada = 0 and s.expira_em > now()
             order by s.id_sala desc limit 1`,
            [req.usuario.id]
        );

        res.json({ sala: salas.length > 0 ? salas[0] : null });

    } catch (erro) {
        console.error('Erro ao buscar a sala ativa:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar o código.' });
    }
};

//------------------------------------------------------------------
// DELETE /salas/ativa   (professor ADM): cancela o código agora
//------------------------------------------------------------------
exports.cancelar = async (req, res) => {
    try {
        await db.query(
            'update sala set cancelada = 1 where id_professor = ? and cancelada = 0',
            [req.usuario.id]
        );

        res.json({ mensagem: 'Código cancelado.' });

    } catch (erro) {
        console.error('Erro ao cancelar a sala:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao cancelar o código.' });
    }
};

//------------------------------------------------------------------
// POST /salas/entrar   (aluno)   body: { "codigo": "123456" }
// só vale se o código existe, não foi cancelado e não expirou. Código errado conta no limitador de tentativas.
//------------------------------------------------------------------
exports.entrar = async (req, res) => {
    if (req.vinculo.papel !== 'aluno') {
        return res.status(403).json({ mensagem: 'Professores não precisam de código: use "Casos exclusivos" para testar.' });
    }

    const validacao = entrarSchema.safeParse(req.body || {});

    if (!validacao.success) {
        return res.status(400).json({ mensagem: validacao.error.issues[0].message });
    }

    try {
        const [salas] = await db.query(
            `select s.id_sala, u.nome as nome_professor,
                    timestampdiff(second, now(), s.expira_em) as segundos_restantes
             from sala s
             inner join usuario u on u.id_usuario = s.id_professor
             where s.codigo = ? and s.cancelada = 0 and s.expira_em > now()
             order by s.id_sala desc limit 1`,
            [validacao.data.codigo]
        );

        if (salas.length === 0) {
            return res.status(404).json({ mensagem: 'Código inválido ou expirado.' });
        }

        //entrar em OUTRA sala interrompe a partida que estava em andamento (a mesma sala não interrompe nada)
        const [atual] = await db.query('select id_sala from aluno_sala where id_usuario = ?', [req.usuario.id]);

        if (atual.length === 0 || atual[0].id_sala !== salas[0].id_sala) {
            await interromperPartidasDoAluno(req.usuario.id, 'trocou_de_sala');
        }

        await db.query(
            `insert into aluno_sala (id_usuario, id_sala) values (?, ?)
             on duplicate key update id_sala = values(id_sala), entrou_em = now()`,
            [req.usuario.id, salas[0].id_sala]
        );

        res.status(201).json({
            mensagem: 'Você entrou na sala.',
            sala: { nome_professor: salas[0].nome_professor, segundos_restantes: salas[0].segundos_restantes }
        });

    } catch (erro) {
        console.error('Erro ao entrar na sala:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao entrar na sala.' });
    }
};

//------------------------------------------------------------------
// GET /salas/minha   (aluno): a sala em que ele está, se o código ainda vale. Senão { sala: null }
// (o vínculo "some" sozinho quando o código expira: ele só vale para COMEÇAR partidas)
//------------------------------------------------------------------
exports.minha = async (req, res) => {
    try {
        const [salas] = await db.query(
            `select u.nome as nome_professor,
                    timestampdiff(second, now(), s.expira_em) as segundos_restantes
             from aluno_sala a
             inner join sala s on s.id_sala = a.id_sala
             inner join usuario u on u.id_usuario = s.id_professor
             where a.id_usuario = ? and s.cancelada = 0 and s.expira_em > now()`,
            [req.usuario.id]
        );

        res.json({ sala: salas.length > 0 ? salas[0] : null });

    } catch (erro) {
        console.error('Erro ao buscar a sala do aluno:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar a sala.' });
    }
};

//------------------------------------------------------------------
// DELETE /salas/minha   (aluno): sai da sala (a partida em andamento vira "interrompida")
//------------------------------------------------------------------
exports.sair = async (req, res) => {
    try {
        await interromperPartidasDoAluno(req.usuario.id, 'saiu_da_sala');
        await db.query('delete from aluno_sala where id_usuario = ?', [req.usuario.id]);

        res.json({ mensagem: 'Você saiu da sala.' });

    } catch (erro) {
        console.error('Erro ao sair da sala:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao sair da sala.' });
    }
};

exports.expirarPartidasVencidas = expirarPartidasVencidas;
