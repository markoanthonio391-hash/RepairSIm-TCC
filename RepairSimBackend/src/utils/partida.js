// Regras da PARTIDA registrada no servidor (casos exclusivos jogados por alunos numa sala).
const conexao = require('../config/db');
const { estrelasPara } = require('./estrelas');

const db = conexao.promise();

//os casos exclusivos dos professores têm a dificuldade do Fácil (1 etapa), então usam as regras de estrelas do Fácil
const DIFICULDADE_EXCLUSIVOS = 'Facil';

//depois de iniciada, a partida vale por até 2 horas (o código da sala só decide quem pode COMEÇAR)
const HORAS_VALIDADE_PARTIDA = 2;

//marca como "interrompida" as partidas em andamento do aluno (saiu da sala, trocou de sala, nova partida, outro login...)
async function interromperPartidasDoAluno(idUsuario, motivo, conexaoExtra = null) {
    const executor = conexaoExtra || db;

    await executor.query(
        `update partida_sala
         set status = 'interrompida', motivo_interrupcao = ?, finalizada_em = now()
         where id_usuario = ? and status = 'em_andamento'`,
        [motivo, idUsuario]
    );
}

//partidas que passaram de 2 horas e nunca foram finalizadas viram "interrompida" (motivo: tempo)
async function expirarPartidasVencidas() {
    await db.query(
        `update partida_sala
         set status = 'interrompida', motivo_interrupcao = 'tempo', finalizada_em = now()
         where status = 'em_andamento' and iniciada_em < date_sub(now(), interval ? hour)`,
        [HORAS_VALIDADE_PARTIDA]
    );
}

//existe uma partida EM ANDAMENTO e dentro das 2 horas deste aluno que inclui este caso?
async function alunoPodeJogarCaso(idUsuario, idDesafio) {
    const [linhas] = await db.query(
        `select ps.id_partida
         from partida_sala ps
         inner join partida_caso pc on pc.id_partida = ps.id_partida
         where ps.id_usuario = ? and pc.id_desafio = ? and ps.status = 'em_andamento'
           and ps.iniciada_em > date_sub(now(), interval ? hour)
         limit 1`,
        [idUsuario, idDesafio, HORAS_VALIDADE_PARTIDA]
    );

    return linhas.length > 0 ? linhas[0].id_partida : null;
}

//chamada a cada verificação de item: guarda acertos, erros e pontos NO SERVIDOR.
//Se o usuário não está numa partida de sala (jogador normal, professor testando), não faz nada.
async function registrarTentativa(idUsuario, idDesafio, ordem, correto, pontos) {
    if (!idUsuario) {
        return;
    }

    const idPartida = await alunoPodeJogarCaso(idUsuario, idDesafio);

    if (!idPartida) {
        return;
    }

    //caso já concluído: ignora (impede somar pontos repetindo a mesma resposta certa)
    const [casos] = await db.query(
        'select concluido from partida_caso where id_partida = ? and id_desafio = ?',
        [idPartida, idDesafio]
    );

    if (casos.length === 0 || casos[0].concluido) {
        return;
    }

    await db.query(
        'update partida_caso set erros = erros + ?, pontos = pontos + ? where id_partida = ? and id_desafio = ?',
        [correto ? 0 : 1, pontos, idPartida, idDesafio]
    );

    await db.query(
        'update partida_sala set erros = erros + ?, pontos = pontos + ? where id_partida = ?',
        [correto ? 0 : 1, pontos, idPartida]
    );

    //acertou a ÚLTIMA etapa do caso = caso concluído
    if (correto) {
        const [ultima] = await db.query(
            'select max(ordem) as ultima from desafio_itens where id_desafio = ?',
            [idDesafio]
        );

        if (Number(ultima[0].ultima) === Number(ordem)) {
            await db.query(
                'update partida_caso set concluido = 1 where id_partida = ? and id_desafio = ?',
                [idPartida, idDesafio]
            );
            await db.query(
                'update partida_sala set casos_concluidos = casos_concluidos + 1 where id_partida = ?',
                [idPartida]
            );
        }
    }
}

//guarda como foi o RELATÓRIO do caso (só o primeiro de cada caso conta). Sem partida de sala, não faz nada.
async function registrarRelatorio(idUsuario, idDesafio, correto, erros) {
    if (!idUsuario) {
        return;
    }

    const idPartida = await alunoPodeJogarCaso(idUsuario, idDesafio);

    if (!idPartida) {
        return;
    }

    const [resultado] = await db.query(
        `update partida_caso set relatorio_correto = ?, erros_relatorio = ?
         where id_partida = ? and id_desafio = ? and relatorio_correto is null`,
        [correto ? 1 : 0, erros, idPartida, idDesafio]
    );

    if (resultado.affectedRows > 0) {
        await db.query(
            'update partida_sala set erros_relatorio = erros_relatorio + ? where id_partida = ?',
            [erros, idPartida]
        );
    }
}

//fim da partida (o front avisa ao salvar o resultado). A NOTA é calculada aqui, com os dados que o servidor guardou.
//devolve { estrelas } ou null (partida inexistente, de outro aluno, já encerrada ou com mais de 2 horas = sem nota)
async function finalizarPartida(idUsuario, idPartida) {
    await expirarPartidasVencidas();

    const [partidas] = await db.query(
        `select casos_total, casos_concluidos, erros from partida_sala
         where id_partida = ? and id_usuario = ? and status = 'em_andamento'`,
        [idPartida, idUsuario]
    );

    if (partidas.length === 0) {
        return null;
    }

    const estrelas = await estrelasPara(
        DIFICULDADE_EXCLUSIVOS, partidas[0].erros, partidas[0].casos_concluidos, partidas[0].casos_total
    );

    const [resultado] = await db.query(
        `update partida_sala set status = 'finalizada', finalizada_em = now(), estrelas = ?
         where id_partida = ? and id_usuario = ? and status = 'em_andamento'`,
        [estrelas, idPartida, idUsuario]
    );

    return resultado.affectedRows > 0 ? { estrelas } : null;
}

module.exports = {
    HORAS_VALIDADE_PARTIDA,
    interromperPartidasDoAluno,
    expirarPartidasVencidas,
    alunoPodeJogarCaso,
    registrarTentativa,
    registrarRelatorio,
    finalizarPartida
};
