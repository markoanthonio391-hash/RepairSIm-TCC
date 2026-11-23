// rotas da SALA DE PROVA (código gerado pelo professor)
const express = require('express');

const router = express.Router();

const salaController = require('../controllers/salaController');
const { autenticar } = require('../middlewares/auth');
const { exigirMembro, exigirAdmin } = require('../middlewares/instituicao');
const { limitadorEntrarSala, limitadorGerarSala } = require('../middlewares/limitadores');

//professor ADM: gera, consulta e cancela o código
router.post('/', autenticar, exigirAdmin, limitadorGerarSala, salaController.gerar);
router.get('/ativa', autenticar, exigirAdmin, salaController.ativa);
router.delete('/ativa', autenticar, exigirAdmin, salaController.cancelar);

//aluno: entra na sala com o código, vê a sala atual e sai dela
router.post('/entrar', autenticar, exigirMembro, limitadorEntrarSala, salaController.entrar);
router.get('/minha', autenticar, exigirMembro, salaController.minha);
router.delete('/minha', autenticar, exigirMembro, salaController.sair);

module.exports = router;
