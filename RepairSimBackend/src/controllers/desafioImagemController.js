const conexao = require('../config/db'); // ele pega a conexão de db.js.

exports.listar = (req, res) => { // sempre que for pedido a listar de imagens desafios, o listar é executado

    const selecao = "select * from desafio_imagens"; // usa o comando sql para seleciona tudo

    conexao.query(selecao, (erro, resultado) => { // executa no MySQL

        if(erro){
            return res.status(500).json(erro); // Retorna json com erro
        }

        res.json(resultado); // Transforma tudo em JSON.

    });

}