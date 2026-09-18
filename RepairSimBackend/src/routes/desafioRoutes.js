//Mini servidor de Desafios
const express = require('express');

const router = express.Router();

const desafioController = require('../controllers/desafioController');

router.get('/', desafioController.listar);

router.get('/:id', desafioController.buscarPorId);

// router.get('/dificuldade/:dificuldade/aleatorios', desafioController.listarAleatoriosPorDificuldade);

router.post('/:id/verificar', desafioController.verificarItem);

module.exports = router;