const conexao = require("../config/db");

//Pra guardar os pontos atuais de cada desafio enquanto o servidor estiver ligado
let pontuacaoDesafios = {};

// Lista todos os desafios
exports.listar = (req, res) => {
    const sql = "SELECT * FROM desafios";

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


//----------------------------------|FUNÇÂO PARA VERIFICAR A RESPOSTA (PINCEL)|-----------------------------np

// Olha se o item que foi escolhido é o correto para o desafio
exports.verificarItem = (req, res) => {

    //id do desafio da URL no caso ele ta buscando
    const id_desafio = req.params.id;

    //id do item que é escolhido pelo jogador
    const { id_item } = req.body;

    //Caso seja a primeira vez que esse desafio está sendo feito,
    //começa a pontuação  em 0
    if (pontuacaoDesafios[id_desafio] === undefined) {
        pontuacaoDesafios[id_desafio] = 0;
    }

    //Verifica se existe essa relação no banco
    const selecao = `
        SELECT *
        FROM desafio_itens
        WHERE id_desafio = ?
        AND id_item = ?
    `;

    conexao.query(
        selecao,
        [id_desafio, id_item],
        (erro, resultado) => {

            if (erro) {
    console.log("Erro ao verificar resposta:", erro);

    return res.status(500).json({
        mensagem: "Erro ao verificar resposta.",
        erro: erro.message
    });
}

            //caso não encontre a relação
            if (resultado.length === 0) {

                //caso erre, perde 5 pontos
                const pontos = -5;

                //Aqui vai descontar os pontos do total atual
                pontuacaoDesafios[id_desafio] += pontos;

                return res.json({
                    correto: false,
                    pontos: pontos,
                    mensagem: "Item incorreto. Você perdeu 5 pontos."
                });
            }

            //encontrou a relação, então o item está correto
            //caso acerte, ganha 10 pontos
            const pontos = 10;

            //Atualiza o total de pontos do desafio
            pontuacaoDesafios[id_desafio] += pontos;

            return res.json({
                correto: true,
                pontos: pontos,
                mensagem: "Parabéns! Você encontrou a solução e ganhou 10 pontos!"
            });
        }
    );
};