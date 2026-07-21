const express = require('express');

const router = express.Router();

const desafioImagemController = require('../controllers/desafioImagemController');

router.get('/', desafioImagemController.listar);

module.exports = router;