const conexao = require('../config/db');

// Lista todos os relatórios
exports.listar = (req, res) => {
    const sql = `select * from relatorio`;

    conexao.query(sql, (erro, resultado) =>{
        if (erro) {
            console.error('Erro ao listar relatórios:', erro);
            return res.status(500).json({
                mensagem: 'Erro ao listar relatório.'
            });
        }
        res.json(resultado);
    });
};

//buscar os dados necessario para montar o relatório
exports.buscarDados = (req, res) => {
    const idDesafio = req.params.id;

    const sql = `select id_desafio, titulo, cliente, problema_relatorio, diagnostico_relatorio 
        from desafios where id_desafio = ?`;
    
    conexao.query(sql, [idDesafio], (erro, resultado) =>{
        if (erro) {
            console.error('Erro ao buscar dados do relatório:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar dados do relatório.'
            });
        }
        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: 'Desafio não encontrado.'
            });
        }
        res.json(resultado[0]);
    });
};

//avalia o relatorio
exports.avaliar = (req, res) =>{
    const idDesafio = req.body.id_desafio;
    const idUsuario = req.body.id_usuario;
    const itensSelecionados = req.body.itens;

    //validando
    if (!idDesafio || !idUsuario || !Array.isArray(itensSelecionados)) {
        return res.status(400).json({
            mensagem: 'Dados do relatório inválidos.'
        });
    }

    //buscando os intens corretos do desafio pelo inner join
    const sqlCorretos = `select i.id_item, i.nome, i.tipo 
        from desafio_itens di inner join itens i on di.id_item = i.id_item where di.id_desafio = ?`;
    
    conexao.query(sqlCorretos, [idDesafio], (erro, itensCorretos) => {
        if (erro) {
            console.error('Erro ao buscar itens corretos:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar itens corretos.'
            });
        }

        //transforma em ids para comparar
        const idsCorretos = itensCorretos.map(
            item => Number(item.id_item)
        );

        const idsSelecionados = itensSelecionados.map(
            id => Number(id)
        );

        //itens corretos que o jogador acertou
        const acertos = idsSelecionados.filter(
            id => idsCorretos.includes(id)
        );

        //itens errados que o jogador adicionou
        const erros = idsSelecionados.filter(
            id => !idsCorretos.includes(id)
        );

        //itens corretos que o jogador esqueceu
        const esquecidos = idsCorretos.filter(
            id => !idsSelecionados.includes(id)
        );

        //cenario 1, acertou tudo
        const acertouTudo = erros.length === 0 && esquecidos.length === 0;

        //cenario 2: acertou alguns, mas errou outros
        const acertouParte = acertos.length > 0 && !acertouTudo;

        //cenario 3, errou tudo
        const errouTudo = acertos.length === 0;

        //conveter ids para objetos
        const acertosDetalhes = itensCorretos.filter(
            item => acertos.includes(Number(item.id_item))
        )

        const erroDetalhes = itensSelecionados.filter(id => erros.includes(Number(id))).map(id => Number(id));
        
        const esquecidosDetalhes = itensCorretos.filter(item => esquecidos.includes(Number(item.id_item)));

        //salvar relatorio
        const inserirRelatorio = `insert into relatorio (id_usuario, id_desafio, relatorio_correto) values (?, ?, ?)`;

        conexao.query(inserirRelatorio, [idUsuario, idDesafio, acertouTudo], (erro, resultadoRelatorio) => {
            if (erro) {
                console.error('Erro ao salvar relatório: ', erro);
                return res.status(500).json({
                    mensagem: 'Erro ao salvar relatório.'
                });
            }
            const idRelatorio = resultadoRelatorio.insertId;

            //parou em salvar itens selecionados
            if (idsSelecionados.length === 0){
                return enviarResposta();
            }

            const valores = idsSelecionados.map(id =>{
                const correto = idsCorretos.includes(Number(id));
                return[idRelatorio, id, correto];
            });

            const inserirItens = `insert into relatorio_itens (id_relatorio, id_item, correto) values ?`;

            conexao.query(inserirItens, [valores], (erro) => {
                if (erro) {
                    console.error(
                        'Erro ao salvar itens do relatório:',
                        erro
                    );
                    return res.status(500).json({
                        mensagem: 'Erro ao salvar itens do relatório.'
                    });
                }

                enviarResposta();
            }
        );

        //enviando a resposta para o front
        function enviarResposta(){
            if (acertouTudo){
                return res.json({
                    correto: true, erros: 0,tipo: 'completo', 
                    mensagem: 'Parabéns! Você registrou corretamente todos os itens utilizados.', 
                    itensCorretos: acertosDetalhes, itensIncorretos: [], itensEsquecidos: []
                });
            }

            if (errouTudo) {
                return res.json({
                    correto: false, erros: erros.length,tipo: 'totalmente_incorreto',
                    mensagem: 'Você não selecionou nenhum dos itens corretos.',
                    itensCorretos: itensCorretos, itensIncorretos: idsSelecionados, itensEsquecidos: esquecidosDetalhes
                });
            }

            if (acertouParte) {
                return res.json({
                    correto: false, erros: erros.length,tipo: 'parcial',
                    mensagem: 'Você acertou parte do relatório, mas selecionou itens incorretos ou deixou itens corretos de fora.',
                    itensCorretos: acertosDetalhes, itensIncorretos: erroDetalhes, itensEsquecidos: esquecidosDetalhes
                });
            }
        }
        })
    })
}