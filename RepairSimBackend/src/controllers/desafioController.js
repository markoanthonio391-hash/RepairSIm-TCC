const conexao = require("../config/db");

// Lista todos os desafios
exports.listar = (req, res) => {
    const sql = "SELECT * FROM desafios WHERE id_instituicao IS NULL"; //só casos padrão: os exclusivos de instituição não aparecem aqui

    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao listar desafios."
            });
        }

        res.json(resultado);
    });
};

// Busca um desafio específico pelo ID
exports.buscarPorId = (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM desafios WHERE id_desafio = ?";

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao buscar o desafio."
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Desafio não encontrado."
            });
        }

        res.json(resultado[0]);
    });
};


//----------------------------------|FUNÇÂO PARA VERIFICAR A ORDEM E O INTEM|-----------------------------np

// Olha se o item que foi escolhido é o correto para o desafio
exports.verificarItem = (req, res) => {

    //id do desafio da URL no caso ele ta buscando
    const idDesafio = Number(req.params.id);

    //id do item que é escolhido pelo jogador
    const idItem = Number(req.body.id_item);

    /*Ordem de ação atual
    nos desafios antigos, o frontend pode n enviar "ordem".
    nesse caso, consideramos a ordem 1 para manter a compatibilidade com os casos de uma unica ação.*/
    const ordem =  req.body.ordem === undefined ? 1 : Number(req.body.ordem);

    //validando os dados recebidos
    if (!Number.isInteger(idDesafio) || idDesafio <= 0 || !Number.isInteger(idItem) || idItem <= 0 || !Number.isInteger(ordem) || ordem <= 0){
        return res.status(400).json({
            correto: false,
            mensagem: "Dados inválidos para verificar o item."
        });
    }

    //consulta a respota do banco
    /*O item só sera correto se estiver relacionado:
    ao desafio informado, 
    ao intem que o jogador clicou, 
    a ordem que esta sendo executada 
    como  no caso 8, que a ordem é saude hd, backup e HD, qualquer um fora dessa ordem n sera aceito*/

    const sql = `select id_desafio_item from desafio_itens where id_desafio = ?
    and id_item = ?
    and ordem = ?
    limit 1`;

    conexao.query(sql, [idDesafio, idItem, ordem],(erro, resultados) => {
        //erro de acesso ao banco
        if (erro) {
            console.error("Erro ao verificar item:", erro);

            return res.status(500).json({correto: false, mensagem: "Erro ao verificar o item."});
        }
        //item incorreto para a ordem atual
        if (resultados.length === 0) {
            return res.json({
                correto: false,
                pontos: -5,
                mensagem: "Item incorreto para esta etapa. Você perdeu 5 pontos"
            });
        }
        //item correto para a ordem atual
        return res.json({
            correto: true,
            pontos: 10,
            mensagem: "Parabéns! Você concluiu corretamente está ação e ganhou 10 pontos."
        });

    });
};

////////////////////////////////DIEGO PART4///////////////////////////////////

exports.listarAleatoriosPorDificuldade = (req, res) => {

    const dificuldade = req.params.dificuldade;

    const dificuldadesPermitidas =[
        'Facil',
        'Medio',
        'Dificil'
    ];

    if (!dificuldadesPermitidas.includes(dificuldade)) {

        return res.status(400).json({
            mensagem: 'Dificuldade inválida.'
    });
}

const sql =`
    select d.*
    from desafios d
    where d.dificuldade = ? and d.id_instituicao is null and exists (select 1 from desafio_imagens_pc dip where dip.id_desafio = d.id_desafio)
    order by rand()
`;


conexao.query(
    sql,
    [dificuldade],
    (erro, resultados) => {
        if (erro) {

            console.error(
                'Erro ao buscar desafios:',
                erro
            );

            return res.status(500).json({
                mensagem:
                       'Erro ao buscar desafios.'
    });

}

const quantidadeDesejada = 10;

let desafiosSelecionados = [];

//Caso normal: Tem 10 ou Mais
if (resultados.length >= quantidadeDesejada) {

    desafiosSelecionados =
        resultados.slice(
            0,
            quantidadeDesejada
        );
}

//TESTE: Ainda não tem 10

else {

    desafiosSelecionados =
        [...resultados];

        const permitirRepeticaoTeste = true;

        if (
            permitirRepeticaoTeste &&
            resultados.length > 0
        ) {

            while (
                desafiosSelecionados.length <
                quantidadeDesejada
            ) {

                const indiceAleatorio =
                    Math.floor(
                        Math.random() *
                        resultados.length
                    );

                    desafiosSelecionados.push(
                        resultados[indiceAleatorio]
                    );
            }
        }
}

//EMBARALHAMENTO NOVAMENTE

desafiosSelecionados.sort(
    () => Math.random() - 0.5
);

res.json({
    quantidade: desafiosSelecionados.length,
    desafios: desafiosSelecionados
});

    }
);
};