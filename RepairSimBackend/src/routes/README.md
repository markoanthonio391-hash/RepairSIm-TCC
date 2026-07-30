EXPLICAÇÃO DAS ROUTERS

O roteador (router) tem como objetivo principal funcionar como a ponte de comunicação do seu sistema. Ele escuta as requisições do usuário na internet e as direciona para a função correta dentro do Controlador (Controller), que é onde a lógica do sistema realmente acontece.
No arquivo de Desafios de Imagem, o código funciona assim:

* const express = require('express'); e const router = express.Router();: Essas duas linhas servem para importar e ativar o sistema de rotas do Express.
* const desafioImagemPcController = require(...): Esta linha importa o controlador dos desafios, trazendo o "cérebro" que sabe o que fazer com as imagens dos PCs.
* router.get('/', desafioImagemPcController.listar);: Esta linha cria uma rota do tipo GET (que serve para pegar ou visualizar dados) para a página inicial (raiz /). Quando o usuário acessa esse endereço, ela aciona a função de listagem do controlador para exibir as imagens na tela.
* module.exports = router;: Exporta essa rota para que o servidor principal consiga reconhecê-la.

No arquivo de Usuários, existe um diferencial importante: além de listar, ele gerencia dados sensíveis (segurança) através de formulários, adicionando novas funções:

* router.get('/', usuarioController.listar);: Funciona igual ao anterior, exibindo a lista de usuários na tela quando a página inicial é acessada.
* router.post('/cadastro', usuarioController.cadastrar);: Esta linha usa o método POST (que serve para enviar/gravar dados). Ela recebe as informações que o usuário digitou no formulário de cadastro e aciona a função de criar a conta no controlador. O POST é usado aqui para esconder e proteger os dados (como a senha) do usuário.
* router.post('/login', usuarioController.login);: Também usa o método POST. Ela recebe o e-mail e a senha digitados pelo usuário, envia de forma segura para o controlador e aciona a função que valida se o acesso está liberado ou não.
