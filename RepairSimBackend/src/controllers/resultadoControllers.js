const conexao = require('../config/db');

// Lista todos os resultados
exports.listar = (req, res) => {

    const selecao = "select * from resultado";

    conexao.query(selecao, (erro, resultado) => {

        if (erro) {
            return res.status(500).json(erro);
        }

        res.json(resultado);

    });

};