//arquivo principal do Backend: inicia o servidor e estabelece a conexão com o banco.

require('dotenv').config(); //carrega as variáveis do arquivo .env

const express = require('express'); //importa o framework Express, ele permite fazer rotas simples do banco. Ex: /desafios

const path = require('path'); //ajuda o servidor a achar a pasta certa de arquivos e imagens


//a seguir, vem as variaveis routers, elas tem o objetivo de puxa todas as informações de cada tabela separadamente 
const desafioRoutes = require('./routes/desafioRoutes'); 

const itemRoutes = require('./routes/itemRoutes');

const usuarioRoutes = require('./routes/usuarioRoutes');

const resultadoRoutes = require('./routes/resultadoRoutes');

const relatorioRoutes = require('./routes/relatorioRoutes');

const desafioImagemRoutes = require('./routes/desafioImagemRoutes');


const cors = require('cors'); //permite o acesso ao servidor pelo FrontEnd

const app = express(); //cria a aplicação Express para ser usada

app.use(cors()); //realiza a conversa entre o back e front

app.use(express.json()); //permite que o servidor entenda e receba dados no formato JSON

app.use(express.static(path.join(__dirname, '../public'))); //libera acesso público a arquivos estáticos (fotos, PDFs, etc.) na pasta 'public'

require('./config/db'); //importa e executa a conexão com o banco de dados


//a seguir, vinculação dos caminhos da URL (endpoints. Ex: /desafios) com os seus respectivos arquivos de rotas
//usado para facilitar a leitura
app.use('/desafios', desafioRoutes);

app.use('/itens', itemRoutes);

app.use('/usuarios', usuarioRoutes);

app.use('/resultados', resultadoRoutes);

app.use('/relatorios', relatorioRoutes);

app.use('/desafioImagem', desafioImagemRoutes);


const porta = 3000; //define a porta que o servidor vai rodar durante a aplicação

//inicia o servidor Node.js e deixa ele escutando as requisições na porta definida
app.listen(porta, () => { 
    console.log(`Servidor rodando na porta ${porta}`);//mensagem que aparece se o servidor roda
});