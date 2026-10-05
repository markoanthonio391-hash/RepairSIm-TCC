const express = require('express');

const router = express.Router();

const resultadoController = require('../controllers/resultadoController');

router.get('/', resultadoController.listar);

router.post('/', resultadoController.criar);

module.exports = router;