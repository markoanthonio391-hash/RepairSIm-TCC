// recebe as imagens do formulário de cadastro de caso (multipart/form-data) usando o multer.
// ficam só na memória até o controller validar tudo (assim nada é gravado no disco se algo estiver errado).
const multer = require('multer');

const TAMANHO_MAXIMO_MB = 2;

//nomes dos campos de arquivo aceitos.
//5 imagens obrigatórias (monitor ligado/desligado, gabinete ligado/desligado e o gabinete aberto LIMPO) + 1 imagem do PROBLEMA (um único campo: o servidor decide se ela é a do
//monitor (software) ou a do gabinete aberto (hardware) olhando o campo origem_problema)
//gabinete_limpo = gabinete aberto de lado e limpo: aparece no fim de um caso de hardware (e se o jogador abrir o gabinete num caso de software)
const CAMPOS_OBRIGATORIOS = ['monitor_ligado', 'monitor_desligado', 'gabinete_ligado', 'gabinete_desligado', 'gabinete_limpo'];
const CAMPOS_OPCIONAIS = ['imagem_problema'];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: TAMANHO_MAXIMO_MB * 1024 * 1024,
        files: CAMPOS_OBRIGATORIOS.length + CAMPOS_OPCIONAIS.length,
        fields: 12,
        fieldSize: 8 * 1024 //tamanho máximo de cada campo de texto
    }
}).fields([...CAMPOS_OBRIGATORIOS, ...CAMPOS_OPCIONAIS].map((nome) => ({ name: nome, maxCount: 1 })));

//executa o multer e converte os erros dele em respostas 400 (e não em erro 500)
function receberImagens(req, res, next) {
    upload(req, res, (erro) => {
        if (!erro) {
            return next();
        }

        if (erro instanceof multer.MulterError) {
            const mensagens = {
                LIMIT_FILE_SIZE: `Cada imagem pode ter no máximo ${TAMANHO_MAXIMO_MB} MB.`,
                LIMIT_UNEXPECTED_FILE: 'Foi enviado um arquivo em um campo não permitido.',
                LIMIT_FILE_COUNT: 'Arquivos demais.',
                LIMIT_FIELD_VALUE: 'Um dos campos de texto é grande demais.'
            };

            return res.status(400).json({ mensagem: mensagens[erro.code] || 'Envio inválido.' });
        }

        console.error('Erro no upload:', erro.message);
        return res.status(400).json({ mensagem: 'Não foi possível ler o formulário enviado.' });
    });
}

module.exports = { receberImagens, CAMPOS_OBRIGATORIOS, CAMPOS_OPCIONAIS };
