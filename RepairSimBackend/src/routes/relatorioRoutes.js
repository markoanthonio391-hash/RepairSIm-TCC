const express = require('express');

const router = express.Router();

const relatorioController = require('../controllers/relatorioController');

const { autenticar, autenticarOpcional } = require('../middlewares/auth');

//relatórios do usuário logado
router.get('/', autenticar, relatorioController.listar);

router.get('/desafio/:id', relatorioController.buscarDados);

//login opcional: logado tem o relatório salvo, visitante apenas é avaliado
router.post('/avaliar', autenticarOpcional, relatorioController.avaliar);

module.exports = router;