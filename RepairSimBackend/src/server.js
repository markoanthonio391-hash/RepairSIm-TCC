//arquivo principal do Backend: inicia o servidor e estabelece a conexão com o banco.

require('dotenv').config(); //carrega as variáveis do arquivo .env

//segurança: sem um segredo forte o login por token não é seguro, então o servidor nem inicia
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('ERRO: defina JWT_SECRET (com no mínimo 32 caracteres) no arquivo .env');
    process.exit(1);
}

const express = require('express'); //importa o framework Express, ele permite fazer rotas simples do banco. Ex: /desafios

const path = require('path'); //ajuda o servidor a achar a pasta certa de arquivos e imagens

const helmet = require('helmet'); //adiciona cabeçalhos HTTP de segurança (contra clickjacking, sniffing, etc.)

const cookieParser = require('cookie-parser'); //permite ler o cookie de login enviado pelo navegador

const { limitadorGeral } = require('./middlewares/limitadores'); //limita o número de requisições por IP


//a seguir, vem as variaveis routers, elas tem o objetivo de puxa todas as informações de cada tabela separadamente 
const desafioRoutes = require('./routes/desafioRoutes'); 

const itemRoutes = require('./routes/itemRoutes');

const usuarioRoutes = require('./routes/usuarioRoutes');

const resultadoRoutes = require('./routes/resultadoRoutes');

const relatorioRoutes = require('./routes/relatorioRoutes');

const imagensPcRoutes = require('./routes/imagensPcRoutes');

const desafioImagensPcRoutes = require('./routes/desafioImagensPcRoutes');


const cors = require('cors'); //permite o acesso ao servidor pelo FrontEnd

const app = express(); //cria a aplicação Express para ser usada

//cabeçalhos de segurança. A política "cross-origin" é necessária porque o front (porta 5173) carrega as imagens deste servidor (porta 3000)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

//só o endereço do front-end pode conversar com a API (e enviar o cookie de login). Pode ter mais de um, separados por vírgula
const origensPermitidas = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim());

app.use(cors({
    origin: origensPermitidas,
    credentials: true //permite o navegador enviar/receber o cookie de login
}));

app.use(express.static(path.join(__dirname, '../public'))); //libera acesso público a arquivos estáticos (fotos, PDFs, etc.) na pasta 'public'

app.use(limitadorGeral); //a partir daqui (rotas da API) vale o limite de requisições

app.use(express.json({ limit: '10kb' })); //permite que o servidor entenda e receba dados no formato JSON (com tamanho máximo)

app.use(cookieParser()); //disponibiliza req.cookies

require('./config/db'); //importa e executa a conexão com o banco de dados


//a seguir, vinculação dos caminhos da URL (endpoints. Ex: /desafios) com os seus respectivos arquivos de rotas
//usado para facilitar a leitura
app.use('/desafios', desafioRoutes);

app.use('/itens', itemRoutes);

app.use('/usuarios', usuarioRoutes);

app.use('/resultados', resultadoRoutes);

app.use('/relatorios', relatorioRoutes);

app.use('/imagens-pc', imagensPcRoutes);

app.use('/desafio-imagens-pc', desafioImagensPcRoutes);


//rota que não existe
app.use((req, res) => {
    res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

//tratamento final de erros: nunca devolve detalhes internos (stack trace) para quem fez a requisição
app.use((erro, req, res, next) => { // eslint-disable-line no-unused-vars
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ mensagem: 'JSON inválido.' });
    }

    if (erro.type === 'entity.too.large') {
        return res.status(413).json({ mensagem: 'Requisição grande demais.' });
    }

    console.error('Erro não tratado:', erro);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});


const porta = 3000; //define a porta que o servidor vai rodar durante a aplicação

//inicia o servidor Node.js e deixa ele escutando as requisições na porta definida
app.listen(porta, () => { 
    console.log(`Servidor rodando na porta ${porta}`);//mensagem que aparece se o servidor roda
});