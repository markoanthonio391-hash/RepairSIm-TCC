const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

router.get('/', usuarioController.listar);

router.post('/cadastro', usuarioController.cadastrar);

//router.post('/login', usuarioController.login);

module.exports = router;