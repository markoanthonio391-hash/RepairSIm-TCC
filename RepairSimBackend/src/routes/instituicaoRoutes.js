const express = require('express');

const router = express.Router();

const instituicaoController = require('../controllers/instituicaoController');

const { autenticar } = require('../middlewares/auth');

const { limitadorEntrarInstituicao } = require('../middlewares/limitadores');

//dados da instituição do usuário logado (e papel dele)
router.get('/minha', autenticar, instituicaoController.minha);

//aluno entra na instituição usando o código de convite
router.post('/entrar', autenticar, limitadorEntrarInstituicao, instituicaoController.entrar);

module.exports = router;
