const express = require('express');

const router = express.Router();

const itemController = require('../controllers/itemController');

router.get('/', itemController.listar);

router.get('/tipo/:tipo', itemController.listarPorTipo);

module.exports = router;