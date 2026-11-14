const conexao = require('../config/db'); // ele pega a conexão de db.js.

exports.listar = (req, res) => { // sempre que for pedido a listar de imagens pc, o listar é executado

    //não lista as imagens que pertencem a casos exclusivos de instituição
    const selecao = `select * from imagens_pc where id_pc not in (
        select dip.id_pc from desafio_imagens_pc dip
        inner join desafios d on d.id_desafio = dip.id_desafio
        where d.id_instituicao is not null)`;

    conexao.query(selecao, (erro, resultado) => { // executa no MySQL

        if(erro){
            return res.status(500).json(erro); // Retorna json com erro
        }

        res.json(resultado); // Transforma tudo em JSON.

    });

}