const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { autenticar, autenticarOpcional } = require('../middlewares/auth');

router.get('/minhas', autenticarOpcional, async (req, res) => {
    if (!req.usuario) {
        return res.status(200).json([]);
    }

    try {
        const [conquistas] = await db.promise().query(
            'SELECT codigo_conquista, titulo, data_conquista FROM conquistas_usuario WHERE id_usuario = ?',
            [req.usuario.id]
        );
        return res.status(200).json(conquistas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar conquistas do usuário.' });
    }
});

router.post('/desbloquear', autenticar, async (req, res) => {
    const id_usuario = req.usuario.id;
    const codigoLimpo = String(req.body?.codigo_conquista || '').trim().toUpperCase();
    const tituloLimpo = String(req.body?.titulo || codigoLimpo).trim();

    if (!codigoLimpo) {
        return res.status(400).json({ erro: 'Código da conquista é obrigatório.' });
    }

    try {
        const conexao = db.promise();
        const query = `
            INSERT INTO conquistas_usuario (id_usuario, codigo_conquista, titulo)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE data_conquista = data_conquista
        `;
<<<<<<< HEAD
        await db.promise().query(query, [id_usuario, codigoLimpo, tituloLimpo]);
=======
        await conexao.query(query, [id_usuario, codigo_conquista, titulo]);

        // Verifica se completou as 3 dificuldades para liberar MESTRE_MUNDOS
        const dificuldades = ['TECNICO_INICIANTE', 'DIAGNOSTICO_MEDIO', 'ESPECIALISTA_BANCADA'];
        if (dificuldades.includes(codigo_conquista)) {
            const [rows] = await conexao.query(
                `SELECT COUNT(DISTINCT codigo_conquista) AS total
                 FROM conquistas_usuario
                 WHERE id_usuario = ? AND codigo_conquista IN (?, ?, ?)`,
                [id_usuario, ...dificuldades]
            );

            if (rows[0]?.total === 3) {
                await conexao.query(query, [id_usuario, 'MESTRE_MUNDOS', 'Mestre dos Três Mundos']);
            }
        }

>>>>>>> origin/dev-diego
        return res.status(200).json({ sucesso: true, mensagem: 'Conquista desbloqueada com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao salvar conquista no banco.' });
    }
});

module.exports = router;