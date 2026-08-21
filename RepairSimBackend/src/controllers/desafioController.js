const conexao = require("../config/db");

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

    //id do item  que é escolhido pelo jogador
    const {id_item} = req.body;

    //Verifica se existe essa relação no banco
    const selecao = `
        Select *
        FROM desafio_itens
        WHERE id_desafio = ?
        AND id_item = ?
    `;

    conexao.query(
        selecao,
        [id_desafio, id_item],
        (erro, resultado) => {

            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao verificar resposta."
                });
            }

            //caso não encontre a relação
            if (resultado.length === 0) {
                return res.json({
                    correto: false,
                    mensagem: "Item incorreto."
                });
            }

            //encontrou a relação
            res.json({
                correto: true,
                mensagem: "Parabéns! Você encontrou a solução!"
            });

            }
        );

    };