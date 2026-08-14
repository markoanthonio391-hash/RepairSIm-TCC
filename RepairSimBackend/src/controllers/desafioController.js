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