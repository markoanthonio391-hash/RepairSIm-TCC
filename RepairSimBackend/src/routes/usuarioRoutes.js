const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

const { autenticar } = require('../middlewares/auth');

const { limitadorLogin, limitadorCadastro } = require('../middlewares/limitadores');

router.post('/cadastro', limitadorCadastro, usuarioController.cadastrar);

router.post('/login', limitadorLogin, usuarioController.login);

router.post('/logout', usuarioController.logout);

router.get('/me', autenticar, usuarioController.me);

module.exports = router;