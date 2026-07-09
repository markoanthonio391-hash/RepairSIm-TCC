//Mini servidor de Desafios
const express = require('express');

const router = express.Router();

const desafioController = require('../controllers/desafioController');

router.get('/', desafioController.listar);

module.exports = router;