// Arquivo principal do Backend: inicia o servidor e estabelece a conexão com o banco.

require('dotenv').config(); // Carrega as variáveis do arquivo .env

const express = require('express'); // Importa o framework Express

const app = express(); // Cria a aplicação Express

require('./config/db'); // Executa a conexão com o banco de dados

const porta = 3000; // Define a porta do servidor

app.listen(porta, () => { // Inicia o servidor
    console.log(`Servidor rodando na porta ${porta}`);
});