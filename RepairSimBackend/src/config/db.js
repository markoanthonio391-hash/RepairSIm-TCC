const mysql = require('mysql2');  //importa a biblioteca do mysql2

//POOL de conexões (antes era uma conexão única).
//Motivo: com uma conexão só, uma transação (beginTransaction/commit) misturaria as consultas de todos os
//jogadores que estivessem usando a API ao mesmo tempo. Com o pool cada transação tem a sua própria conexão.
//Tudo que já existia continua funcionando igual: conexao.query(sql, params, callback) e conexao.promise().query(...)
const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
});

//teste de conexão ao iniciar (só para avisar no console se o banco estiver errado)
conexao.getConnection((erro, conexaoTeste) => {
    if (erro) {
        console.log("Erro ao conectar:", erro.message);
    }
    else{
        console.log("Banco conectado!");
        conexaoTeste.release(); //devolve a conexão para o pool
    }
});

module.exports = conexao; //exportando a conexão, qualquer aquivo pode usar ela. EX: const conexao = require('../config/db');
