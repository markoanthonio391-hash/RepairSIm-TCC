const express = require('express');

const router = express.Router();

const desafioImagemPcController = require('../controllers/desafioImagensPcController');

router.get('/', desafioImagemPcController.listar);

module.exports = router;