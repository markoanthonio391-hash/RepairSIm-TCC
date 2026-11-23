const conexao = require('../config/db');
const { finalizarPartida } = require('../utils/partida');
const { estrelasPara } = require('../utils/estrelas');
const { z } = require('zod');

//limites usados para conferir o placar (ajuste aqui se mudar a pontuação do jogo)
const PONTOS_MAXIMO_POR_CASO = 30; //3 etapas x 10 pontos (Difícil)
const PONTOS_BASE_MAXIMO = 500; //folga acima do maior pontos_base cadastrado (300)
const SEGUNDOS_MINIMOS_POR_CASO = 5;

//molde dos dados que o front pode enviar ao finalizar uma jogatina.
//o id do usuário NÃO vem daqui: ele é pego do cookie de login (req.usuario)
const resultadoSchema = z.object({
    dificuldade: z.enum(['Facil', 'Medio', 'Dificil']),
    quantidade_casos: z.number().int().min(0).max(99),
    erros_desafio: z.number().int().min(0).max(1000).default(0),
    erros_relatorio: z.number().int().min(0).max(1000).default(0),
    pontos: z.number().int().min(-1000000).max(1000000), //pode ser negativo pois existem penalidades
    tempo_segundos: z.number().int().min(0).max(7 * 24 * 60 * 60).default(0),
    id_partida: z.number().int().positive().optional() //só nas partidas de casos exclusivos (sala do professor)
}).superRefine((dados, contexto) => {
    //O navegador é quem informa os pontos, então o servidor confere se o placar é POSSÍVEL (não é uma prova absoluta,
    //mas barra os placares absurdos no Histórico). Cada etapa certa vale +10 e o difícil tem 3 etapas, logo no máximo 30 por caso.
    //O pontos_base (soma uma vez por partida) fica abaixo de PONTOS_BASE_MAXIMO.
    const maximoPossivel = PONTOS_BASE_MAXIMO + dados.quantidade_casos * PONTOS_MAXIMO_POR_CASO;

    if (dados.pontos > maximoPossivel) {
        contexto.addIssue({ code: 'custom', path: ['pontos'], message: 'Pontuação impossível.' });
    }

    //tempo mínimo plausível: ninguém conclui um caso (ligar, abrir, usar o item e fazer o relatório) em menos de poucos segundos
    if (dados.pontos > 0 && dados.tempo_segundos < dados.quantidade_casos * SEGUNDOS_MINIMOS_POR_CASO) {
        contexto.addIssue({ code: 'custom', path: ['tempo_segundos'], message: 'Tempo implausível.' });
    }
});

// salva o resultado de uma jogatina do usuário logado e devolve as ESTRELAS (0 a 5) calculadas pelo servidor
//  - partida de casos exclusivos (id_partida): a nota usa os acertos/erros que o SERVIDOR guardou durante a partida.
//    Partida interrompida, encerrada ou com mais de 2 horas = sem nota (estrelas null)
//  - jogo normal: a nota usa os erros informados pelo navegador (não dá para conferir no servidor)
exports.criar = async (req, res) => {
    const validacao = resultadoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(400).json({
            mensagem: 'Dados do resultado incompletos ou inválidos.'
        });
    }

    const {dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos, id_partida} = validacao.data;

    try {
        let estrelas = null;

        if (id_partida) {
            const fim = await finalizarPartida(req.usuario.id, id_partida);
            estrelas = fim ? fim.estrelas : null;
        } else {
            estrelas = await estrelasPara(dificuldade, erros_desafio, quantidade_casos, quantidade_casos);
        }

        const [resultado] = await conexao.promise().query(
            `insert into resultado (id_usuario, dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos, estrelas)
             values (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, dificuldade, quantidade_casos, erros_desafio, erros_relatorio, pontos, tempo_segundos, estrelas]
        );

        res.status(201).json({
            mensagem: 'Resultado salvo com sucesso.', id_resultado: resultado.insertId, estrelas
        });

    } catch (erro) {
        console.error('Erro ao salvar resultado:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao salvar resultado.'
        });
    }
};

// histórico do usuário logado (usado pela tela de Histórico)
// os "as" devolvem os nomes de campos que o Historico.jsx já usa
exports.meus = (req, res) => {
    const sql = `select
            id_resultado as id,
            data_finalizacao as data_partida,
            dificuldade,
            pontos as pontuacao,
            quantidade_casos as casos,
            estrelas,
            (erros_desafio + erros_relatorio) as erros,
            tempo_segundos
        from resultado
        where id_usuario = ?
        order by data_finalizacao desc, id_resultado desc
        limit 200`;

    conexao.query(sql, [req.usuario.id], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao buscar histórico:', erro);
            return res.status(500).json({
                mensagem: 'Erro ao buscar o histórico.'
            });
        }

        res.json({ partidas: resultado });
    });
};