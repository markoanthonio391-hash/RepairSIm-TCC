const express = require('express');

const router = express.Router();

const relatorioController = require('../controllers/relatorioController');

router.get('/', relatorioController.listar);

router.get('/desafio/:id', relatorioController.buscarDados);

router.post('/avaliar', relatorioController.avaliar);

module.exports = router;