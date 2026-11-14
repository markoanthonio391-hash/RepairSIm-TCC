const conexao = require('../config/db'); // ele pega a conexão de db.js.

exports.listar = (req, res) => { // sempre que for pedido a listar de desafio imagens pc, o listar é executado

    //só os desafios padrão (id_instituicao nulo): as imagens dos casos exclusivos não aparecem numa listagem pública
    const selecao = `select dip.* from desafio_imagens_pc dip
        inner join desafios d on d.id_desafio = dip.id_desafio
        where d.id_instituicao is null`;

    conexao.query(selecao, (erro, resultado) => { // executa no MySQL

        if(erro){
            return res.status(500).json(erro); // Retorna json com erro
        }

        res.json(resultado); // Transforma tudo em JSON.

    });

}

exports.listarPorDesafio = (req, res) =>{//lista apenas as imagens que tem no desafio
    const idDesafio = req.params.id; //pega pelo id da url

    //busca as imagens e seus caminhos cruzando as tabelas e filtrando pelo id usando inner join.
    const selecao = `select desafio_imagens_pc.id_desafio,
    desafio_imagens_pc.funcao,
    imagens_pc.id_pc,
    imagens_pc.nome,
    imagens_pc.caminho_imagem
    from desafio_imagens_pc
    inner join imagens_pc
    on desafio_imagens_pc.id_pc = imagens_pc.id_pc
    where desafio_imagens_pc.id_desafio = ?`;

    //executa a busca no banco passando o id do desafio e retorna o resultado ou erro
    conexao.query(selecao, [idDesafio], (erro, resultado) =>{
        if(erro){
            return res.status(500).json({mensagem: "Erro ao buscar imagens do desafio."})
        }
        //retorna o que achou
        res.json(resultado);
    });
};