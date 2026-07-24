const conexao = require('../config/db');
const bcrypt = require('bcrypt'); //aplica o bycript para criptografa as senhas

// lista todos os usuários
exports.listar = (req, res) => {

    const selecao = "select * from usuario";

    conexao.query(selecao, (erro, resultado) => {

        if (erro) {
            return res.status(500).json(erro);
        }

        res.json(resultado);

    });

};

//cadastra um novo usuario
exports.cadastrar = async (req, res) => {
    const {
        nome,
        username,
        data_nascimento,
        email,
        senha
    } = req.body;
    
    if(!nome || !username || !data_nascimento || !email || !senha) { //verifica se cada campo tem dado
        return res.status(400).json({
            mensagem: 'Preencha todos os campos!'
        });
    }

    if(senha.length < 6) { //verifica se a senha tem menos de 6 caracteres
        return res.status(400).json({
            mensagem: 'A senha deve possuir no minimo 6 caracteres!'
        });
    }

    try {
        const verificacaoUsuario = 'select id_usuario from usuario where email = ? or username = ?'; //verifica se o email ou username já estão cadastrados
    
        conexao.query(verificacaoUsuario,[email, username],async (erro,resultado) => {
            if(erro){
                return res.status(500).json({
                    mensagem: 'Erro ao verificar usuário'
                });
            }

            if(resultado.length > 0){
                return res.status(409).json({
                    mensagem: 'Email ou username já estão cadastrado.'
                });
            }
            
            const cripSenha = await bcrypt.hash(senha, 10); //criptografia da senha

            const inserirUsuario = 'insert into usuario (nome, username, data_nascimento, email, senha) values (?, ?, ?, ?, ?)'; //inseri as informações do novo usuario

            conexao.query(
                inserirUsuario, [nome, username, data_nascimento, email, cripSenha], (erro) => {
                    if(erro){
                        return res.status(500).json({
                            mensagem: 'Erro ao cadastrar usuário.'
                        });
                    }
                    else{
                        res.status(201).json({
                            mensagem: 'Usuário cadastrado com sucesso!'
                        });
                    }
                }
            );
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: 'Erro interno do servidor.'
        });
    }
};