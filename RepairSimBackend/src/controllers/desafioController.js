const conexao = require("../config/db");
const { validarEtapas, buscarEtapas } = require("../utils/etapas");
const { registrarTentativa } = require("../utils/partida");

// Lista todos os desafios
exports.listar = (req, res) => {
    const sql = "SELECT * FROM desafios WHERE origem_problema IS NULL"; //só casos padrão: os exclusivos dos professores não aparecem aqui

    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao listar desafios."
            });
        }

        res.json(resultado);
    });
};

// Busca um desafio específico pelo ID
exports.buscarPorId = (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM desafios WHERE id_desafio = ?";

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao buscar o desafio."
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Desafio não encontrado."
            });
        }

        res.json(resultado[0]);
    });
};


//----------------------------------|FUNÇÂO PARA VERIFICAR A ORDEM E O INTEM|-----------------------------np

// Olha se o item que foi escolhido é o correto para o desafio
// guarda no SERVIDOR o acerto/erro quando quem joga é um aluno numa partida de sala (não faz nada para os demais jogadores).
// Se der erro aqui o jogo segue normalmente: só o registro da partida deixa de ser atualizado.
async function anotarNaPartida(req, idDesafio, ordem, correto, pontos) {
    try {
        await registrarTentativa(req.usuario ? req.usuario.id : null, idDesafio, ordem, correto, pontos);
    } catch (erro) {
        console.error("Erro ao registrar a tentativa na partida:", erro.message);
    }
}

exports.verificarItem = (req, res) => {

    //id do desafio da URL no caso ele ta buscando
    const idDesafio = Number(req.params.id);

    //id do item que é escolhido pelo jogador
    const idItem = Number(req.body.id_item);

    /*Ordem de ação atual
    nos desafios antigos, o frontend pode n enviar "ordem".
    nesse caso, consideramos a ordem 1 para manter a compatibilidade com os casos de uma unica ação.*/
    const ordem =  req.body.ordem === undefined ? 1 : Number(req.body.ordem);

    //validando os dados recebidos
    if (!Number.isInteger(idDesafio) || idDesafio <= 0 || !Number.isInteger(idItem) || idItem <= 0 || !Number.isInteger(ordem) || ordem <= 0){
        return res.status(400).json({
            correto: false,
            mensagem: "Dados inválidos para verificar o item."
        });
    }

    //consulta a respota do banco
    /*O item só sera correto se estiver relacionado:
    ao desafio informado, 
    ao intem que o jogador clicou, 
    a ordem que esta sendo executada 
    como  no caso 8, que a ordem é saude hd, backup e HD, qualquer um fora dessa ordem n sera aceito*/

    const sql = `select id_desafio_item from desafio_itens where id_desafio = ?
    and id_item = ?
    and ordem = ?
    limit 1`;

    conexao.query(sql, [idDesafio, idItem, ordem], async (erro, resultados) => {
        //erro de acesso ao banco
        if (erro) {
            console.error("Erro ao verificar item:", erro);

            return res.status(500).json({correto: false, mensagem: "Erro ao verificar o item."});
        }
        //item incorreto para a ordem atual
        if (resultados.length === 0) {
            await anotarNaPartida(req, idDesafio, ordem, false, -5);

            return res.json({
                correto: false,
                pontos: -5,
                mensagem: "Item incorreto para esta etapa. Você perdeu 5 pontos"
            });
        }
        //item correto para a ordem atual
        await anotarNaPartida(req, idDesafio, ordem, true, 10);

        return res.json({
            correto: true,
            pontos: 10,
            mensagem: "Parabéns! Você concluiu corretamente está ação e ganhou 10 pontos."
        });

    });
};

// Etapas do desafio: quantas são e ONDE cada uma acontece (software = PC ligado e gabinete fechado,
// hardware = PC desligado e gabinete aberto). Não revela qual é o item correto.
exports.listarEtapas = async (req, res) => {
    const idDesafio = Number(req.params.id);

    if (!Number.isInteger(idDesafio) || idDesafio <= 0) {
        return res.status(400).json({ mensagem: "Desafio inválido." });
    }

    try {
        const [desafios] = await conexao.promise().query(
            "select id_desafio, dificuldade, pc_inicial, desliga_sozinho_segundos from desafios where id_desafio = ?",
            [idDesafio]
        );

        if (desafios.length === 0) {
            return res.status(404).json({ mensagem: "Desafio não encontrado." });
        }

        const { resumo, etapas } = await buscarEtapas(idDesafio);

        if (etapas.length === 0) {
            return res.status(404).json({ mensagem: "Este desafio não tem etapas cadastradas." });
        }

        const validacao = validarEtapas(desafios[0].dificuldade, resumo);

        res.json({
            id_desafio: idDesafio,
            dificuldade: desafios[0].dificuldade,
            total_etapas: etapas.length,
            valido: validacao.valido,
            motivo: validacao.motivo,
            //comportamento do computador no INÍCIO do caso (ex.: caso 4 começa desligado e, se for ligado,
            //desliga sozinho por superaquecimento depois de alguns segundos). null = não desliga sozinho.
            config: {
                pc_inicial: desafios[0].pc_inicial,
                desliga_sozinho_segundos: desafios[0].desliga_sozinho_segundos
            },
            etapas
        });

    } catch (erro) {
        console.error("Erro ao buscar etapas:", erro.message);
        res.status(500).json({ mensagem: "Erro ao buscar as etapas do desafio." });
    }
};

////////////////////////////////DIEGO PART4///////////////////////////////////

exports.listarAleatoriosPorDificuldade = (req, res) => {

    const dificuldade = req.params.dificuldade;

    const dificuldadesPermitidas =[
        'Facil',
        'Medio',
        'Dificil'
    ];

    if (!dificuldadesPermitidas.includes(dificuldade)) {

        return res.status(400).json({
            mensagem: 'Dificuldade inválida.'
    });
}

//total_etapas e os dados usados pela REGRA DE ETAPAS (Facil = 1, Medio = 2, Dificil = 3) vem do desafio_itens
const sql =`
    select d.*, e.total_etapas, e.ordens_distintas, e.primeira_ordem, e.ultima_ordem
    from desafios d
    inner join (
        select id_desafio, count(*) as total_etapas, count(distinct ordem) as ordens_distintas,
               min(ordem) as primeira_ordem, max(ordem) as ultima_ordem
        from desafio_itens group by id_desafio
    ) e on e.id_desafio = d.id_desafio
    where d.dificuldade = ? and d.origem_problema is null and exists (select 1 from desafio_imagens_pc dip where dip.id_desafio = d.id_desafio)
    order by rand()
`;


conexao.query(
    sql,
    [dificuldade],
    (erro, resultadosBrutos) => {
        if (erro) {

            console.error(
                'Erro ao buscar desafios:',
                erro
            );

            return res.status(500).json({
                mensagem:
                       'Erro ao buscar desafios.'
    });

}

//REGRA DE ETAPAS: só entra na jogatina o caso com a quantidade de etapas da dificuldade, em sequência.
//um caso fora da regra NÃO quebra o jogo: ele só deixa de ser sorteado, e o motivo aparece no console do servidor.
const resultados = resultadosBrutos.filter((caso) => {
    const validacao = validarEtapas(dificuldade, caso);

    if (!validacao.valido) {
        console.warn(`Caso ${caso.id_desafio} (${caso.titulo}) fora da regra de etapas e ignorado: ${validacao.motivo}`);
    }

    return validacao.valido;
});

//não devolve as colunas auxiliares da regra para o front (total_etapas continua indo)
resultados.forEach((caso) => {
    delete caso.ordens_distintas;
    delete caso.primeira_ordem;
    delete caso.ultima_ordem;
});

if (resultados.length === 0) {
    return res.status(404).json({
        mensagem: 'Ainda não há casos válidos para esta dificuldade.'
    });
}

//SEM REPETIÇÃO: a partida tem no máximo 10 casos e cada caso aparece uma única vez.
//Se existirem menos de 10 casos válidos nesta dificuldade, a partida tem só esses (e termina na tela de resultado).
const quantidadeDesejada = 10;

const desafiosSelecionados = resultados.slice(0, quantidadeDesejada);

//a consulta já vem em ordem aleatória (order by rand()), então não precisa embaralhar de novo

res.json({
    quantidade: desafiosSelecionados.length,
    desafios: desafiosSelecionados
});

    }
);
};