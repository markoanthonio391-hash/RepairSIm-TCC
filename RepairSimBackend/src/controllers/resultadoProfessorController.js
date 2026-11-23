// TELA DE RESULTADOS DO PROFESSOR: as salas dele, as partidas dos alunos em cada sala e o detalhe de cada partida.
// O professor só enxerga salas e partidas dele (sala.id_professor / partida_sala.id_professor = quem está logado).
// Datas saem já formatadas pelo MySQL (evita diferença de fuso horário entre servidor e navegador).
const conexao = require('../config/db');
const { expirarPartidasVencidas } = require('../utils/partida');

const db = conexao.promise();

//------------------------------------------------------------------
// GET /professor/salas : as últimas 50 salas (códigos) que o professor gerou
//------------------------------------------------------------------
exports.listarSalas = async (req, res) => {
    try {
        const [salas] = await db.query(
            `select s.id_sala, s.codigo,
                    date_format(s.criada_em, '%d/%m/%Y %H:%i') as criada_em,
                    (s.cancelada = 0 and s.expira_em > now()) as ativa,
                    (select count(*) from partida_sala p where p.id_sala = s.id_sala) as partidas,
                    (select count(distinct p.id_usuario) from partida_sala p where p.id_sala = s.id_sala) as alunos
             from sala s
             where s.id_professor = ?
             order by s.id_sala desc
             limit 50`,
            [req.usuario.id]
        );

        res.json({ salas: salas.map((s) => ({ ...s, ativa: Boolean(s.ativa) })) });

    } catch (erro) {
        console.error('Erro ao listar as salas do professor:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar as salas.' });
    }
};

//------------------------------------------------------------------
// GET /professor/salas/:id/partidas : todas as partidas dos alunos naquela sala
// "tentativa" = a 1ª, 2ª, 3ª... partida do MESMO aluno na sala (a partir da 2ª, o aluno recomeçou)
//------------------------------------------------------------------
exports.partidasDaSala = async (req, res) => {
    const idSala = Number(req.params.id);

    if (!Number.isInteger(idSala) || idSala <= 0) {
        return res.status(400).json({ mensagem: 'Sala inválida.' });
    }

    try {
        await expirarPartidasVencidas(); //partidas esquecidas por mais de 2 horas viram "interrompida" antes de listar

        const [salas] = await db.query(
            'select id_sala from sala where id_sala = ? and id_professor = ?',
            [idSala, req.usuario.id]
        );

        if (salas.length === 0) {
            return res.status(404).json({ mensagem: 'Sala não encontrada.' });
        }

        const [partidas] = await db.query(
            `select p.id_partida, p.id_usuario, u.nome, u.username,
                    p.status, p.motivo_interrupcao,
                    date_format(p.iniciada_em, '%d/%m/%Y %H:%i') as iniciada_em,
                    timestampdiff(second, p.iniciada_em, coalesce(p.finalizada_em, now())) as duracao_segundos,
                    p.casos_total, p.casos_concluidos, p.erros, p.erros_relatorio, p.pontos, p.estrelas
             from partida_sala p
             inner join usuario u on u.id_usuario = p.id_usuario
             where p.id_sala = ? and p.id_professor = ?
             order by u.nome, p.iniciada_em, p.id_partida`,
            [idSala, req.usuario.id]
        );

        //conta as tentativas de cada aluno (a lista já vem ordenada por aluno e por horário)
        const totais = {};
        partidas.forEach((p) => { totais[p.id_usuario] = (totais[p.id_usuario] || 0) + 1; });

        const vistas = {};
        const resposta = partidas.map((p) => {
            vistas[p.id_usuario] = (vistas[p.id_usuario] || 0) + 1;

            return { ...p, tentativa: vistas[p.id_usuario], tentativas_total: totais[p.id_usuario] };
        });

        res.json({ partidas: resposta });

    } catch (erro) {
        console.error('Erro ao listar as partidas da sala:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar as partidas.' });
    }
};

//------------------------------------------------------------------
// GET /professor/partidas/:id : o desempenho do aluno em cada caso da partida
//------------------------------------------------------------------
exports.detalhePartida = async (req, res) => {
    const idPartida = Number(req.params.id);

    if (!Number.isInteger(idPartida) || idPartida <= 0) {
        return res.status(400).json({ mensagem: 'Partida inválida.' });
    }

    try {
        const [partidas] = await db.query(
            'select id_partida from partida_sala where id_partida = ? and id_professor = ?',
            [idPartida, req.usuario.id]
        );

        if (partidas.length === 0) {
            return res.status(404).json({ mensagem: 'Partida não encontrada.' });
        }

        const [casos] = await db.query(
            `select pc.ordem, d.titulo, pc.concluido, pc.erros, pc.pontos, pc.relatorio_correto, pc.erros_relatorio
             from partida_caso pc
             inner join desafios d on d.id_desafio = pc.id_desafio
             where pc.id_partida = ?
             order by pc.ordem`,
            [idPartida]
        );

        res.json({
            casos: casos.map((c) => ({
                ...c,
                concluido: Boolean(c.concluido),
                relatorio_correto: c.relatorio_correto === null ? null : Boolean(c.relatorio_correto)
            }))
        });

    } catch (erro) {
        console.error('Erro ao buscar o detalhe da partida:', erro.message);
        res.status(500).json({ mensagem: 'Erro ao buscar a partida.' });
    }
};
