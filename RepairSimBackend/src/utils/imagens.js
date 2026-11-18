// funções de apoio para as imagens enviadas pelo ADM ao cadastrar um caso exclusivo
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

//pasta pública onde as imagens ficam (o express.static já serve tudo que está em /public)
const PASTA_EXCLUSIVOS = path.join(__dirname, '../../public/imagens/exclusivos');

//não confiamos no mimetype nem no nome que o navegador manda (dá para falsificar).
//olhamos os primeiros bytes do arquivo ("assinatura") para descobrir o formato de verdade.
//SVG fica de fora de propósito: ele pode carregar JavaScript.
function detectarExtensao(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return null;
    }

    //PNG
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return 'png';
    }

    //JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'jpg';
    }

    //WEBP ("RIFF" + 4 bytes de tamanho + "WEBP")
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
        return 'webp';
    }

    return null;
}

//grava a imagem com nome aleatório (nunca usa o nome enviado pelo usuário).
//devolve { caminho: '/imagens/exclusivos/3/abc.png' (o que vai pro banco), arquivo: caminho absoluto no disco }
async function salvarImagem(buffer, extensao, idInstituicao) {
    const pasta = path.join(PASTA_EXCLUSIVOS, String(idInstituicao));
    await fs.promises.mkdir(pasta, { recursive: true });

    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;
    const arquivo = path.join(pasta, nomeArquivo);

    await fs.promises.writeFile(arquivo, buffer, { flag: 'wx' }); //wx: nunca sobrescreve um arquivo existente

    return {
        caminho: `/imagens/exclusivos/${idInstituicao}/${nomeArquivo}`,
        arquivo
    };
}

//apaga arquivos (usado quando o cadastro falha no meio e precisamos desfazer)
async function removerArquivos(arquivos) {
    await Promise.all(arquivos.map(async (arquivo) => {
        try {
            await fs.promises.unlink(arquivo);
        } catch {
            //se já não existe, tudo bem
        }
    }));
}

module.exports = { detectarExtensao, salvarImagem, removerArquivos };
