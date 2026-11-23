const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para buscar todas as conquistas desbloqueadas de um usuário
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const [conquistas] = await db.promise().query(
            'SELECT codigo_conquista, titulo, data_conquista FROM conquistas_usuario WHERE id_usuario = ?',
            [id_usuario]
        );
        return res.status(200).json(conquistas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar conquistas do usuário.' });
    }
});

// Rota para desbloquear ou registrar uma conquista
router.post('/desbloquear', async (req, res) => {
    const { id_usuario, codigo_conquista, titulo } = req.body;

    if (!id_usuario || !codigo_conquista) {
        return res.status(400).json({ erro: 'ID do usuário e código da conquista são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO conquistas_usuario (id_usuario, codigo_conquista, titulo)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE data_conquista = data_conquista
        `;
        await db.promise().query(query, [id_usuario, codigo_conquista, titulo]);
        return res.status(200).json({ sucesso: true, mensagem: 'Conquista desbloqueada com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao salvar conquista no banco.' });
    }
});

module.exports = router;