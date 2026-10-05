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

exports.criar = (req, res) => {
    const {id_usuario, dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos} = req.body;

    if (!id_usuario || !dificuldade || quantidade_casos === undefined) {
        return res.status(400).json({
            mensagem: 'Dados do resultado incompletos.'
        });
    }

    const sql = `insert into resultado (id_usuario, dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos) values (?, ?, ?, ?, ?, ?, ?)`;

    conexao.query(sql, [id_usuario, dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao salvar resultado:', erro);
            return res.status(500).json({
            mensagem: 'Erro ao salvar resultado.'
        });
        }

        res.status(201).json({
            mensagem: 'Resultado salvo com sucesso.', id_resultado: resultado.insertId
        });
    }
    );
};