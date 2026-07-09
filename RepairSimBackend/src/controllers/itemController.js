const conexao = require('../config/db');

exports.listar = (req, res) => {

    const sql = "select * from itens";

    conexao.query(sql, (erro, resultado) => {

        if (erro) {
            return res.status(500).json(erro);
        }

        res.json(resultado);

    });

};