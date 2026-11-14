const conexao = require('../config/db');
const bcrypt = require('bcrypt'); //aplica o bcrypt para criptografar as senhas
const { z } = require('zod'); //valida e limpa tudo que chega do front antes de usar
const { NOME_COOKIE, opcoesCookie, opcoesCookieLogin, gerarToken } = require('../utils/token');
const { buscarVinculo, vinculoParaFront } = require('../utils/vinculo');

const db = conexao.promise(); //mesma conexão, mas permite usar async/await nas consultas

const CUSTO_BCRYPT = 12; //quanto maior, mais difícil de quebrar a senha por força bruta (o padrão era 10)

//hash "de mentira": quando o email não existe, comparamos a senha com ele só para gastar o mesmo
//tempo de um login real. Sem isso, o tempo de resposta revelaria quais emails estão cadastrados.
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-igualar-o-tempo', CUSTO_BCRYPT);

//molde do padrão do email, q permite apenas email com @ e que venha seguido de um ponto depois
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cadastroSchema = z.object({
    nome: z.string().trim()
        .min(2, 'O nome deve possuir no mínimo 2 caracteres!')
        .max(100, 'O nome não pode passar de 100 caracteres!'),

    username: z.string().trim()
        .regex(/^[A-Za-z0-9_.]{3,30}$/, 'O username deve ter de 3 a 30 caracteres, usando apenas letras, números, ponto ou _.'),

    data_nascimento: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida.')
        .refine((valor) => {
            const data = new Date(`${valor}T00:00:00Z`);
            return !Number.isNaN(data.getTime())
                && data.toISOString().slice(0, 10) === valor //barra datas impossíveis, ex: 31/02
                && data <= new Date() //não pode ser no futuro
                && data.getUTCFullYear() >= 1900;
        }, 'Data de nascimento inválida.'),

    email: z.string().trim().toLowerCase() //email sempre em minúsculo evita contas duplicadas
        .max(100, 'O e-mail não pode passar de 100 caracteres!')
        .regex(regexEmail, 'Digite um e-mail válido.'),

    senha: z.string()
        .min(8, 'A senha deve possuir no mínimo 8 caracteres!')
        .max(64, 'A senha não pode passar de 64 caracteres!')
        .refine((s) => Buffer.byteLength(s, 'utf8') <= 72, 'A senha é muito longa.') //o bcrypt ignora o que passa de 72 bytes
        .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')
        .regex(/\d/, 'A senha deve conter pelo menos um número.')
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1).max(100),
    senha: z.string().min(1).max(128)
});

//pega a primeira mensagem de erro do zod
function mensagemDeErro(erroZod) {
    const primeiro = erroZod.issues[0];
    //campo ausente ou com tipo errado
    return primeiro.code === 'invalid_type' ? 'Preencha todos os campos!' : primeiro.message;
}

//cadastra um novo usuario
exports.cadastrar = async (req, res) => {
    const validacao = cadastroSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(400).json({
            mensagem: mensagemDeErro(validacao.error)
        });
    }

    const { nome, username, data_nascimento, email, senha } = validacao.data;

    try {
        //verifica se o email ou username já estão cadastrados
        const [existentes] = await db.query(
            'select id_usuario from usuario where email = ? or username = ?',
            [email, username]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Email ou username já estão cadastrados.'
            });
        }

        const cripSenha = await bcrypt.hash(senha, CUSTO_BCRYPT); //criptografia da senha

        //inseri as informações do novo usuario
        await db.query(
            'insert into usuario (nome, username, data_nascimento, email, senha) values (?, ?, ?, ?, ?)',
            [nome, username, data_nascimento, email, cripSenha]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!'
        });

    } catch (erro) {
        //duas pessoas cadastrando o mesmo email ao mesmo tempo: o banco (unique) barra a segunda
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Email ou username já estão cadastrados.'
            });
        }

        console.error('Erro ao cadastrar usuário:', erro.message);
        res.status(500).json({
            mensagem: 'Erro interno do servidor.'
        });
    }
};

//realiza o login do usuário
exports.login = async (req, res) => {
    const validacao = loginSchema.safeParse(req.body);

    if (!validacao.success) { //verifica se os campos foram preenchidos
        return res.status(400).json({
            mensagem: 'Preencha o email e a senha'
        });
    }

    const { email, senha } = validacao.data;

    try {
        //procura o usuário pelo email
        const [resultado] = await db.query(
            'select id_usuario, nome, username, senha from usuario where email = ?',
            [email]
        );

        const usuario = resultado[0];

        //compara a senha enviada com a senha criptografada (sempre roda, mesmo se o email não existir)
        const senhaCorreta = await bcrypt.compare(senha, usuario ? usuario.senha : HASH_FALSO);

        //mesma mensagem para "email não existe" e "senha errada": não revela quais emails existem
        if (!usuario || !senhaCorreta) {
            return res.status(401).json({
                mensagem: 'Email ou senha incorretos.'
            });
        }

        //contas antigas (criadas com custo 10) são atualizadas para o custo atual no primeiro login
        if (bcrypt.getRounds(usuario.senha) < CUSTO_BCRYPT) {
            try {
                const novoHash = await bcrypt.hash(senha, CUSTO_BCRYPT);
                await db.query('update usuario set senha = ? where id_usuario = ?', [novoHash, usuario.id_usuario]);
            } catch (erro) {
                console.error('Não foi possível atualizar o hash da senha:', erro.message);
            }
        }

        //o token vai num cookie httpOnly, o JavaScript do navegador não consegue lê-lo
        res.cookie(NOME_COOKIE, gerarToken(usuario), opcoesCookieLogin());

        //instituição e papel (aluno/admin) do usuário. O front usa isso só para mostrar ou esconder botões;
        //quem realmente barra o acesso é o servidor, consultando o banco a cada requisição
        const vinculo = await buscarVinculo(usuario.id_usuario);

        //só dados básicos vão para o react (nunca a senha nem o email)
        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                username: usuario.username,
                ...vinculoParaFront(vinculo)
            }
        });

    } catch (erro) {
        console.error('Erro ao realizar login:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao buscar o usuário.'
        });
    }
};

//encerra a sessão apagando o cookie
exports.logout = (req, res) => {
    res.clearCookie(NOME_COOKIE, opcoesCookie());
    res.status(200).json({ mensagem: 'Logout realizado com sucesso!' });
};

//devolve o usuário da sessão atual (o front usa para saber se o login ainda vale)
exports.me = async (req, res) => {
    try {
        const [resultado] = await db.query(
            'select id_usuario, nome, username from usuario where id_usuario = ?',
            [req.usuario.id]
        );

        if (resultado.length === 0) { //usuário apagado do banco: derruba a sessão
            res.clearCookie(NOME_COOKIE, opcoesCookie());
            return res.status(401).json({ mensagem: 'Sessão inválida.' });
        }

        const vinculo = await buscarVinculo(req.usuario.id);

        res.json({ usuario: { ...resultado[0], ...vinculoParaFront(vinculo) } });

    } catch (erro) {
        console.error('Erro ao buscar sessão:', erro.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};