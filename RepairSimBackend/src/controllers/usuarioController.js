const conexao = require('../config/db');
const bcrypt = require('bcrypt'); //aplica o bycript para criptografa as senhas

// lista todos os usuários
exports.listar = (req, res) => {

    const selecao = "select id_usuario, nome, username, data_nascimento, email, criado_em from usuario";

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

    if(senha.length > 20) { //verifica se a senha tem menos de 6 caracteres
        return res.status(400).json({
            mensagem: 'A senha não pode passar de 20 caracteres!'
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

//realiza o login do usuário
exports.login = (req, res) => {
    const {
        email,
        senha
    } = req.body;

    if(!email || !senha){ //verifica se os campos foram preenchidos
        return res.status(400).json({
            mensagem: 'Preencha o email e a senha'
        });
    }

    //procura o usuário pelo email
    const buscarUsuario = 'select id_usuario, nome, username, email, senha from usuario where email = ?'
    conexao.query(buscarUsuario, [email], async (erro, resultado) => {
        if(erro){ //verifica se ocorreu um erro no banco
            return res.status(500).json({
                mensagem: 'Erro ao buscar o usuário.'
            });
        }

        if (resultado.length === 0){//verifica se o email existe
            return res.status(401).json({
                mensagem: 'Email ou senha incorretos.'
            });
        }

        const usuario = resultado[0];

        const senhaCorreta = await bcrypt.compare(//compara a senha enviada com a senha criptografada
            senha, usuario.senha
        );

        if(!senhaCorreta){
            return res.status(401).json({
                 mensagem: 'Email ou senha incorretos.'
            });
        }

        delete usuario.senha; //deleta a senha antes de envia os dados para o react

        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario: usuario
        });
        
    });
}