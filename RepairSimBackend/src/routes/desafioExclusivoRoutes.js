const express = require('express');

const router = express.Router();

const desafioExclusivoController = require('../controllers/desafioExclusivoController');

const { autenticar } = require('../middlewares/auth');

const { exigirMembro, exigirAdmin } = require('../middlewares/instituicao');

const { receberImagens } = require('../middlewares/upload');

const { limitadorCriarDesafio } = require('../middlewares/limitadores');

//sorteia casos exclusivos para jogar (aluno ou ADM da instituição). Fica antes de "/:id" por segurança
router.get('/jogar', autenticar, exigirMembro, desafioExclusivoController.sortearParaJogar);

//ADM: lista os casos da própria instituição
router.get('/', autenticar, exigirAdmin, desafioExclusivoController.listar);

//ADM: cadastra um caso (multipart/form-data com textos + imagens).
//a ordem importa: primeiro confere se é ADM, só depois aceita o upload
router.post('/', autenticar, exigirAdmin, limitadorCriarDesafio, receberImagens, desafioExclusivoController.criar);

//ADM: remove (desativa) um caso da própria instituição
router.delete('/:id', autenticar, exigirAdmin, desafioExclusivoController.desativar);

module.exports = router;
