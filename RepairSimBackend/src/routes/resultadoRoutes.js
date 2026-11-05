const express = require('express');

const router = express.Router();

const resultadoController = require('../controllers/resultadoController');

const { autenticar } = require('../middlewares/auth')

//histórico de partidas do usuário logado
router.get('/meus', autenticar, resultadoController.meus);

//salvar resultado: só quem está logado. Quem joga sem conta recebe 401 e o front nem tenta salvar
router.post('/', autenticar, resultadoController.criar);

module.exports = router;