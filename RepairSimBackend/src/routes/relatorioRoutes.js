const express = require('express');

const router = express.Router();

const relatorioController = require('../controllers/relatorioController');

const { autenticar, autenticarOpcional } = require('../middlewares/auth');

const { exigirAcessoDesafio } = require('../middlewares/instituicao');

//relatórios do usuário logado
router.get('/', autenticar, relatorioController.listar);

//casos exclusivos: só quem é da instituição dona do caso acessa
router.get('/desafio/:id', autenticarOpcional, exigirAcessoDesafio((req) => req.params.id), relatorioController.buscarDados);

//login opcional: logado tem o relatório salvo, visitante apenas é avaliado
router.post('/avaliar', autenticarOpcional, exigirAcessoDesafio((req) => req.body && req.body.id_desafio), relatorioController.avaliar);

module.exports = router;