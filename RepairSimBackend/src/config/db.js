const mysql = require('mysql2');  //importa a biblioteca do mysql2

const conexao = mysql.createConnection({ //conexao do banco
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

conexao.connect((erro) => { //tentativa de conexão
    if (erro) {
        console.log("Erro ao conectar:", erro.message);
    }
    else{
        console.log("Banco conectado!");
    }
});

module.exports = conexao; //exportando a conexão, qualquer aquivo pode usar ela. EX: const conexao = require('../config/db');