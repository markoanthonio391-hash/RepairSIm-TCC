//Mini servidor de Desafios
const express = require('express');

const router = express.Router();

const desafioController = require('../controllers/desafioController');

const { autenticarOpcional } = require('../middlewares/auth');

const { exigirAcessoDesafio } = require('../middlewares/instituicao');

//casos exclusivos: só quem é da instituição dona do caso acessa. Casos padrão continuam livres (inclusive sem login)
const acessoPorId = [autenticarOpcional, exigirAcessoDesafio((req) => req.params.id)];

router.get('/', desafioController.listar);

router.get('/dificuldade/:dificuldade/aleatorios', desafioController.listarAleatoriosPorDificuldade);

router.get('/:id', acessoPorId, desafioController.buscarPorId);

router.post('/:id/verificar', acessoPorId, desafioController.verificarItem);

module.exports = router;