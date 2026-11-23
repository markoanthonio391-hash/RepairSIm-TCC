// rotas da tela de RESULTADOS DO PROFESSOR (só professor ADM)
const express = require('express');

const router = express.Router();

const resultadoProfessorController = require('../controllers/resultadoProfessorController');
const { autenticar } = require('../middlewares/auth');
const { exigirAdmin } = require('../middlewares/instituicao');

router.get('/salas', autenticar, exigirAdmin, resultadoProfessorController.listarSalas);
router.get('/salas/:id/partidas', autenticar, exigirAdmin, resultadoProfessorController.partidasDaSala);
router.get('/partidas/:id', autenticar, exigirAdmin, resultadoProfessorController.detalhePartida);

module.exports = router;
