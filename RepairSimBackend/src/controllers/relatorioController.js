const conexao = require('../config/db');

// Lista todos os relatórios
exports.listar = (req, res) => {

    const selecao = "select * from relatorio";

    conexao.query(selecao, (erro, resultado) => {

        if (erro) {
            return res.status(500).json(erro);
        }

        res.json(resultado);

    });

};