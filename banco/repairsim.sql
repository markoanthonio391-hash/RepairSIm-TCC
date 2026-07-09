create database repairsim1;

use repairsim1;

create table usuario (
    id_usuario int auto_increment primary key,
    nome varchar(100) not null,
    username varchar(40) not null unique,
    data_nascimento date not null,
    email varchar(100) not null unique,
    senha varchar(255) not null,
    criado_em timestamp not null default current_timestamp
);

-- tabela dos desafios
create table desafios (
    id_desafio int auto_increment primary key,
    titulo varchar(80) not null,
    descricao varchar(255) not null,
    imagem_pc varchar(255) not null, 
    dica varchar(255),
    dificuldade enum('Facil', 'Medio', 'Dificil') not null,
    pontos_base int not null default 0
);

-- tabela de todas as peças e ferramentas do jogo
create table itens (
    id_item int auto_increment primary key,
    nome varchar(80) not null,
    tipo enum('peca', 'ferramenta') not null,
    caminho_imagem varchar(255) not null
);

-- relaciona os desafios com os itens
create table desafio_itens (
    id_desafio_item int auto_increment primary key,
    id_desafio int not null,
    id_item int not null,
    e_correto boolean not null default false,

    constraint fk_desafio_itens_desafio
        foreign key (id_desafio)
        references desafios(id_desafio)
        on delete cascade,

    constraint fk_desafio_itens_item
        foreign key (id_item)
        references itens(id_item)
);

-- resultado final do jogador
create table resultado (
    id_resultado int auto_increment primary key,
    id_usuario int not null,
    id_desafio int not null,
    erros int not null default 0,
    pontos int not null default 0,
    tempo_segundos int not null default 0,

    constraint fk_resultado_usuario
        foreign key (id_usuario)
        references usuario(id_usuario),

    constraint fk_resultado_desafio
        foreign key (id_desafio)
        references desafios(id_desafio)
);

-- relatório preenchido pelo jogador
create table relatorio (
    id_relatorio int auto_increment primary key,
    id_resultado int not null unique,
    texto_base text not null,
    peca_escolhida varchar(80) not null,
    ferramenta_escolhida varchar(80) not null,
    observacao text,

    constraint fk_relatorio_resultado
        foreign key (id_resultado)
        references resultado(id_resultado)
        on delete cascade
);

INSERT INTO itens (nome, tipo, caminho_imagem) VALUES
('Pasta termica','ferramenta','/imagens/itens/pasta_termica.jpeg'),
('Chave de Fenda', 'ferramenta', '/imagens/itens/chave_philips.jpeg'),
('Pincel', 'ferramenta', '/imagens/itens/pincel.jpeg');

INSERT INTO desafios (titulo, descricao, imagem_pc, dica, dificuldade, pontos_base) VALUES
('Caso 01 – Acúmulo de Poeira', ' Meu computador está ficando muito quente quando uso programas simples. As ventoinhas fazem bastante barulho e às vezes o sistema fica lento ou trava','/imagens/pc/pc_ligado.jpeg', 'Abra o gabinete e faça uma limpeza geral.', 'Facil', 100),
('Caso 02 - Memória ram Mal Emcaixada',' Quando aperto o botão de ligar, as luzes acendem, mas a tela continua preta','/imagens/pc/pc_ligado.jpeg', 'Verifique o encaixe e limpe os contatos das memórias.', 'Facil', 100),
('Caso 03 - Cabo sata Desconectado',' Meu computador liga, mas aparece uma mensagem dizendo que não encontrou o sistema', '/imagens/pc/pc_ligado.jpeg', 'Verifique se os cabos do HD/SSD estão bem firmes.', 'Facil', 100),
('Caso 04 - Pasta termica ressecada',' O computador está esquentando muito e desligando sozinho', '/imagens/pc/pc_ligado.jpeg', 'Verifique se os cabos do HD/SSD estão bem firmes.', 'Facil', 100);

update desafios
set dica = 'Verifique a pasta térmica e o sistema de refrigeração do processador.'
where id_desafio = 4;

select * from desafios;
