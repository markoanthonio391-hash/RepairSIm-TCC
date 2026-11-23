// REGRA DE ETAPAS POR DIFICULDADE
//   Facil = 1 etapa | Medio = 2 etapas | Dificil = 3 etapas
// "Etapa" é a coluna "ordem" da tabela desafio_itens (a mesma que o Caso 8 já usa: saúde do HD = 1, backup = 2, trocar o HD = 3).
// Um caso é VÁLIDO quando tem exatamente a quantidade de etapas da sua dificuldade, em sequência (1, 2, 3...), com UM item por etapa.
const conexao = require('../config/db');

const db = conexao.promise();

const ETAPAS_POR_DIFICULDADE = Object.freeze({
    Facil: 1,
    Medio: 2,
    Dificil: 3
});

//quantas etapas a dificuldade exige (null = dificuldade desconhecida)
function etapasEsperadas(dificuldade) {
    return ETAPAS_POR_DIFICULDADE[dificuldade] ?? null;
}

// A FUNÇÃO QUE OBRIGA A REGRA.
// "resumo" = { total_etapas, ordens_distintas, primeira_ordem, ultima_ordem } (vem do banco ou de calcularResumo)
// devolve { valido, esperado, motivo }
function validarEtapas(dificuldade, resumo) {
    const esperado = etapasEsperadas(dificuldade);

    if (esperado === null) {
        return { valido: false, esperado, motivo: `Dificuldade desconhecida: ${dificuldade}.` };
    }

    const total = Number(resumo?.total_etapas || 0);
    const distintas = Number(resumo?.ordens_distintas || 0);
    const primeira = Number(resumo?.primeira_ordem || 0);
    const ultima = Number(resumo?.ultima_ordem || 0);

    if (total !== esperado) {
        return { valido: false, esperado, motivo: `Tem ${total} etapa(s), mas ${dificuldade} exige ${esperado}.` };
    }

    if (distintas !== total) {
        return { valido: false, esperado, motivo: 'Há mais de um item cadastrado na mesma etapa.' };
    }

    //com total = esperado e ordens sem repetição, começar em 1 e terminar em "esperado" garante 1, 2, 3... sem buracos
    if (primeira !== 1 || ultima !== esperado) {
        return { valido: false, esperado, motivo: `As etapas precisam ser numeradas de 1 a ${esperado}, sem buracos.` };
    }

    return { valido: true, esperado, motivo: null };
}

//monta o "resumo" a partir da lista de etapas de um desafio (linhas de desafio_itens)
function calcularResumo(linhas) {
    const ordens = linhas.map((linha) => Number(linha.ordem));

    return {
        total_etapas: linhas.length,
        ordens_distintas: new Set(ordens).size,
        primeira_ordem: ordens.length ? Math.min(...ordens) : 0,
        ultima_ordem: ordens.length ? Math.max(...ordens) : 0
    };
}

//ONDE a etapa acontece, sem revelar qual é o item certo:
//  software -> computador LIGADO e gabinete FECHADO (como as etapas 1 e 2 do Caso 8)
//  hardware -> computador DESLIGADO e gabinete ABERTO (como a etapa 3 do Caso 8)
//deriva do tipo do item correto: 'software' = software; 'peca' e 'ferramenta' = hardware
function modoDaEtapa(tipoItem) {
    return tipoItem === 'software' ? 'software' : 'hardware';
}

//IMAGENS POR ETAPA (opcional). Em desafio_imagens_pc, uma imagem com a função:
//  monitor_etapa_N   = o que o MONITOR mostra enquanto o jogador está na etapa N
//  gabinete_etapa_N  = o que o GABINETE ABERTO mostra enquanto o jogador está na etapa N
//Se o caso não tiver imagem para aquela etapa, o campo vem null e o jogo usa as imagens de sempre.
//Exemplo (caso 5): etapa 1 = gabinete com faíscas (aviso para usar o multímetro); etapa 2 = fonte queimada.
function funcaoDaEtapa(funcoesDoCaso, prefixo, ordem) {
    const funcao = `${prefixo}_etapa_${ordem}`;

    return funcoesDoCaso.has(funcao) ? funcao : null;
}

//busca as etapas de um desafio (ordem, modo e imagens da etapa). NUNCA devolve o id ou o nome do item correto
async function buscarEtapas(idDesafio) {
    const [linhas] = await db.query(
        `select di.ordem, i.tipo as tipo_item
         from desafio_itens di
         inner join itens i on i.id_item = di.id_item
         where di.id_desafio = ?
         order by di.ordem`,
        [idDesafio]
    );

    const [imagens] = await db.query(
        'select funcao from desafio_imagens_pc where id_desafio = ?',
        [idDesafio]
    );

    const funcoesDoCaso = new Set(imagens.map((imagem) => imagem.funcao));

    return {
        resumo: calcularResumo(linhas),
        etapas: linhas.map((linha) => ({
            ordem: Number(linha.ordem),
            modo: modoDaEtapa(linha.tipo_item),
            funcao_monitor: funcaoDaEtapa(funcoesDoCaso, 'monitor', Number(linha.ordem)),
            funcao_gabinete: funcaoDaEtapa(funcoesDoCaso, 'gabinete', Number(linha.ordem))
        }))
    };
}

module.exports = { ETAPAS_POR_DIFICULDADE, etapasEsperadas, validarEtapas, calcularResumo, modoDaEtapa, buscarEtapas };