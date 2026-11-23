// ESTRELAS (0 a 5), calculadas pelo SERVIDOR.
// Regra: contamos os ERROS POR CASO CONCLUÍDO e comparamos com os limites da tabela regra_estrelas (por dificuldade).
// Depois a nota é reduzida proporcionalmente se o jogador não concluiu todos os casos da partida.
//   Fácil (de 1 em 1):   0 erros por caso = 5 estrelas | até 1 = 4 | até 2 = 3 | até 3 = 2 | até 4 = 1 | acima disso = 0
//   Médio (de 2 em 2):   0 = 5 | até 2 = 4 | até 4 = 3 | até 6 = 2 | até 8 = 1 | acima disso = 0
//   Difícil (de 3 em 3): 0 = 5 | até 3 = 4 | até 6 = 3 | até 9 = 2 | até 12 = 1 | acima disso = 0
const conexao = require('../config/db');

const db = conexao.promise();

//limites usados só se a tabela regra_estrelas estiver vazia (a tabela é quem manda)
const REGRAS_PADRAO = {
    Facil: [0, 1, 2, 3, 4],
    Medio: [0, 2, 4, 6, 8],
    Dificil: [0, 3, 6, 9, 12]
};

//devolve { Facil: [{ estrelas: 5, max: 0 }, { estrelas: 4, max: 1 }, ...], Medio: [...], Dificil: [...] } (de 5 para 1)
async function carregarRegras() {
    const [linhas] = await db.query(
        'select dificuldade, estrelas, max_erros_por_caso from regra_estrelas order by dificuldade, estrelas desc'
    );

    const regras = {};

    for (const linha of linhas) {
        if (!regras[linha.dificuldade]) {
            regras[linha.dificuldade] = [];
        }
        regras[linha.dificuldade].push({ estrelas: Number(linha.estrelas), max: Number(linha.max_erros_por_caso) });
    }

    for (const [dificuldade, limites] of Object.entries(REGRAS_PADRAO)) {
        if (!regras[dificuldade]) {
            regras[dificuldade] = limites.map((max, indice) => ({ estrelas: 5 - indice, max }));
        }
    }

    return regras;
}

//função pura (fácil de testar): devolve um inteiro de 0 a 5
function calcularEstrelas(regras, dificuldade, erros, casosConcluidos, casosTotal) {
    const concluidos = Number(casosConcluidos);
    const total = Number(casosTotal);

    if (!(concluidos > 0) || !(total > 0)) {
        return 0;
    }

    const errosPorCaso = Math.max(0, Number(erros) || 0) / concluidos;

    let base = 0;

    for (const regra of regras[dificuldade] || []) { //da 5ª estrela para a 1ª: vale a primeira que couber
        if (errosPorCaso <= regra.max) {
            base = regra.estrelas;
            break;
        }
    }

    const completude = Math.min(1, concluidos / total);

    return Math.round(base * completude);
}

async function estrelasPara(dificuldade, erros, casosConcluidos, casosTotal) {
    const regras = await carregarRegras();

    return calcularEstrelas(regras, dificuldade, erros, casosConcluidos, casosTotal);
}

module.exports = { carregarRegras, calcularEstrelas, estrelasPara };
