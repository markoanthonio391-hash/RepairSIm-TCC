const express = require('express'); //importa o framework Express para gerenciamento de rotas

const router = express.Router(); //cria uma instância do roteador do Express para definir as rotas isoladas

//importa o controlador responsável
const desafioImagemPcController = require('../controllers/desafioImagensPcController');

//define a rota GET(pegar) para a raiz ("/") que aciona o método de listagem do controlador
router.get('/', desafioImagemPcController.listar);

//exporta para que outros tenham acesso (como o servidor)
module.exports = router;