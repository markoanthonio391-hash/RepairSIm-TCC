const conexao = require('../config/db');

exports.listar = (req, res) => {

    const sql = "select * from itens";

    conexao.query(sql, (erro, resultado) => {

        if (erro) {
            console.error('Erro ao listar itens:', erro);
            return res.status(500).json({ mensagem: 'Erro interno.' });
        }

        res.json(resultado);

    });

};

exports.listarPorTipo = (req, res) => {

    const tipo = req.params.tipo;

    const tiposPermitidos = ['peca', 'ferramenta', 'software'];

    //impede que seja enviado um tipo inexistente
    if (!tiposPermitidos.includes(tipo)) {

        return res.status(400).json({
            mensagem: "Tipo de item inválido."
        });
    }

    const sql = "SELECT * FROM itens WHERE tipo = ?";

    conexao.query(sql, [tipo], (erro, resultado) => {

        if (erro) {
            console.error("Erro ao buscar itens por tipo:", erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar itens."
            });
        }

        res.json(resultado);
    });
};