const express = require('express');

const router = express.Router();

const imagemPcController = require('../controllers/imagensPcController');

router.get('/', imagemPcController.listar);

module.exports = router;