// Arquivo principal do Backend: inicia o servidor e estabelece a conexão com o banco.

require('dotenv').config(); // Carrega as variáveis do arquivo .env

const express = require('express'); // Importa o framework Express

const path = require('path'); //se um arquivo existe ele pode abri no navergador, como imagens

const desafioRoutes = require('./routes/desafioRoutes'); // importa as informações de deafios

const itemRoutes = require('./routes/itemRoutes');

const usuarioRoutes = require('./routes/usuarioRoutes');

const resultadoRoutes = require('./routes/resultadoRoutes');

const relatorioRoutes = require('./routes/relatorioRoutes');

const desafioImagemRoutes = require('./routes/desafioImagemRoutes');

const cors = require('cors');

const app = express(); // Cria a aplicação Express

app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));

require('./config/db'); // Executa a conexão com o banco de dados

app.use('/desafios', desafioRoutes);

app.use('/itens', itemRoutes);

app.use('/usuarios', usuarioRoutes);

app.use('/resultados', resultadoRoutes);

app.use('/relatorios', relatorioRoutes);

app.use('/desafioImagem', desafioImagemRoutes);

const porta = 3000; // Define a porta do servidor

app.listen(porta, () => { // Inicia o servidor
    console.log(`Servidor rodando na porta ${porta}`);
});