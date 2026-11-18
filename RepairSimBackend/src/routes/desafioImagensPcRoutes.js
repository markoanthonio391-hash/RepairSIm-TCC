const express = require('express'); //importa o framework Express para gerenciamento de rotas

const router = express.Router(); //cria uma instância do roteador do Express para definir as rotas isoladas

//importa o controlador responsável
const desafioImagemPcController = require('../controllers/desafioImagensPcController');

const { autenticarOpcional } = require('../middlewares/auth');

const { exigirAcessoDesafio } = require('../middlewares/instituicao');

//define a rota GET(pegar) para a raiz ("/") que aciona o método de listagem do controlador
router.get('/', desafioImagemPcController.listar);

//listar apenas as imagens de um desafio
//casos exclusivos: só quem é da instituição dona do caso vê as imagens
router.get('/desafio/:id', autenticarOpcional, exigirAcessoDesafio((req) => req.params.id), desafioImagemPcController.listarPorDesafio);

//exporta para que outros tenham acesso (como o servidor)
module.exports = router;