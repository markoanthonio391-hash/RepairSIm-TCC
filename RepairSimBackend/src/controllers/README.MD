EXPLICAÇÃO GERAL DE COMO FUNCIONA AS CONTROLLERS

O controlador (Controller) tem como objetivo principal funcionar como o cérebro da aplicação. Ele recebe as requisições que a rota direcionou, processa as regras de negócio, faz consultas ao banco de dados e devolve a resposta final para o usuário.
Na estrutura geral dos controladores, o código padrão funciona assim:

* const conexao = require(...): Importa a configuração do banco de dados para que o controlador possa salvar ou buscar informações.
* exports.listar = (req, res) => { ... }: É a função básica que todos os controladores têm. Ela executa um comando select no banco de dados para buscar os registros e usa res.json(resultado) para enviar essa lista direto para a tela do usuário.

No controlador de Usuários, existe o grande diferencial do sistema: ele gerencia a segurança e o acesso às contas usando a biblioteca bcrypt. O funcionamento detalhado de suas funções de cadastro e login ocorre assim:

* const bcrypt = require('bcrypt');: Importa a ferramenta de segurança que serve para criptografar as senhas, garantindo que ninguém consiga ver a senha real do usuário no banco de dados.
* exports.cadastrar = async (req, res) => { ... }: Esta função cria um novo usuário no sistema em blocos de validação. Primeiro, ela confere se todos os campos foram preenchidos e se o tamanho da senha está correto. Depois, usa uma regra (regexEmail) para checar se o e-mail tem o formato válido com @ e .com. Em seguida, ela consulta o banco de dados para garantir que o e-mail ou username já não pertencem a outra pessoa.
* O uso do Bcrypt no Cadastro (bcrypt.hash): Se tudo estiver correto, a linha await bcrypt.hash(senha, 10) entra em ação. Ela transforma a senha limpa (ex: "123456") em um código embaralhado e irreconhecível. É esse código seguro que o comando insert into salva definitivamente no banco de dados.
* exports.login = (req, res) => { ... }: Esta função faz o caminho inverso para autorizar a entrada do usuário. Ela recebe o e-mail e a senha digitados na tela, valida se os campos estão preenchidos e faz um select no banco de dados procurando por aquele e-mail. Se o e-mail não existir, o sistema barra o acesso imediatamente.
* O uso do Bcrypt no Login (bcrypt.compare): Como a senha no banco de dados está criptografada, o sistema usa a linha await bcrypt.compare(senha, usuario.senha). Ela pega a senha que o usuário digitou agora, joga no tradutor do bcrypt e confere se ela bate com o código embaralhado que estava salvo. Se forem iguais, o sistema executa o delete usuario.senha por segurança (para nunca enviar a senha de volta para o frontend) e libera o login do usuário com sucesso.