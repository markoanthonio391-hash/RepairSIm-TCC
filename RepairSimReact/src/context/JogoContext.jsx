/*import { createContext, useContext, useState } from "react";

//cria um contexto no react para gerenciar o todo o jogo
const JogoContext = createContext(null); //começa como null para dps ser preenchido

//CONTEXTO DA JOGATINA

//o provider é quem gerencia o estado total da partida, permitindo com que as outras telas acessem os dados do jogo
export function JogoProvider({ children }){ 
    //estado centralizado/padrão do jogo
const [jogatina, setJogatina] = useState({
    dificuldade: null,
    desafios: [],
    indiceAtual: 0,
    quantidadeCasos: 10,
    pontos: 0,
    errosDesafio: 0,
    errosRelatorio: 0,
    tempoInicio: null
});

//INICIAR UMA NOVA JOGATINA
//inicializa o estado do jogo com os desafios escolhidos e define a pontuação
function iniciarJogatina(dificuldade, desafiosSelecionados){
    //validação de segurança para impedir o inicio de um jogo sem conteudo
    if (desafiosSelecionados.length === 0) {
        console.error("Nenhum desafio selecionado.");
        return;
    }

    //coloca aqui o pontos bases com base no primeiro desafio
    const pontosBase = desafiosSelecionados[0].pontos_base;

    //reseta o estado para valores de um novo jogo
    setJogatina({
        dificuldade,
        desafios: desafiosSelecionados,
        indiceAtual: 0,
        quantidadeCasos: desafiosSelecionados.length,
        pontos: pontosBase,
        errosDesafio: 0,
        errosRelatorio: 0,
        tempoInicio: Date.now() //registra o momento do inicio da partida
    });
}

//DESAFIO ATUAL
function getDesafioAtual(){
    //retorna o objeto do desafio correspondente á posição(indice) atual na lista
    return jogatina.desafios[jogatina.indiceAtual];
}

//ADICIONA / REMOVE PONTOS
function adicionarPontos(valor){
    //atualizar a pontuação somando o valor recebido ao total
    setJogatina(prev => ({...prev, pontos: prev.pontos + valor}));
}

//REGISTRA ERRO NO DESAFIO
function registraErroDesafio(){
    //adiciona em 1 o contador de erros cometidos durante a jogatina
    setJogatina(prev => ({...prev, errosDesafio: prev.errosDesafio + 1}));
}

//REGISTRA ERRO NO RELATÓRIO
function registraErroRelatorio(){
    setJogatina(prev => ({...prev, errosRelatorio: prev.errosRelatorio + 1}));
}

//avança para o próximo desafio
function proximoDesafio(){
    //muda a posição atual do indice para a proxima, exibindo o proximo desafio
    setJogatina(prev =>({...prev, indiceAtual: prev.indiceAtual + 1}));
}

//retorno do contexto
return(
    //retorna todo o estado do jogo para os componentes filhos
    <JogoContext.Provider value={{
        jogatina, iniciarJogatina, getDesafioAtual, adicionarPontos,
        registraErroDesafio, registraErroRelatorio, proximoDesafio
    }}>
        {children}
    </JogoContext.Provider>
);
    
}

//hook(ligação com outros componentes)
export function useJogo(){
    const contexto = useContext(JogoContext);

    //garante que o hook só seja usado por componentes que estão em JogoProvider, evitando erro de indefinido
    if (!contexto){
        throw new Error("useJogo precisa estar dentro de JogoProvider.")
    }

    return contexto;
}*/

import { createContext, useContext, useState } from "react";

const JogoContext = createContext(null);

export function JogoProvider({ children }) {

    const [jogatina, setJogatina] = useState({
        idUsuario: 1,
        dificuldade: null,
        desafios: [],
        indiceAtual: 0,
        quantidadeCasos: 10,
        pontos: 0,
        errosDesafio: 0,
        errosRelatorio: 0,
        tempoInicio: null,
        tempoSegundos: 0,
        dataFinalizacao: null,
        baseAplicado: false,
        finalizada: false
    });

    function iniciarJogatina(dificuldade, desafiosSelecionados) {
        if (desafiosSelecionados.length === 0) {
            console.error("Nenhum desafio selecionado.");
            return;
        }

        setJogatina({
            idUsuario: 1,
            dificuldade,
            desafios: desafiosSelecionados,
            indiceAtual: 0,
            quantidadeCasos: desafiosSelecionados.length,
            pontos: 0, // o pontos_base entra em aceitarDesafio()
            errosDesafio: 0,
            errosRelatorio: 0,
            tempoInicio: Date.now(),
            tempoSegundos: 0,
            dataFinalizacao: null,
            baseAplicado: false,
            finalizada: false
        });
    }

    function getDesafioAtual() {
        return jogatina.desafios[jogatina.indiceAtual];
    }

    // soma o pontos_base uma única vez, ao aceitar o primeiro desafio
    function aceitarDesafio() {
        setJogatina(prev => {
            if (prev.baseAplicado) return prev;
            const base = Number(prev.desafios[prev.indiceAtual]?.pontos_base || 0);
            return { ...prev, pontos: prev.pontos + base, baseAplicado: true };
        });
    }

    function adicionarPontos(valor) {
        setJogatina(prev => ({ ...prev, pontos: prev.pontos + Number(valor || 0) }));
    }

    function registrarErroDesafio() {
        setJogatina(prev => ({ ...prev, errosDesafio: prev.errosDesafio + 1 }));
    }

    function registrarErrosRelatorio(quantidade) {
        setJogatina(prev => ({
            ...prev,
            errosRelatorio: prev.errosRelatorio + Number(quantidade || 0)
        }));
    }

    function ehUltimoDesafio() {
        return jogatina.indiceAtual >= jogatina.desafios.length - 1;
    }

    function proximoDesafio() {
        setJogatina(prev => ({ ...prev, indiceAtual: prev.indiceAtual + 1 }));
    }

    // recebe os erros do último relatório, porque o estado ainda não foi atualizado
    async function finalizarJogatina(errosRelatorioExtras = 0) {
        const tempoTotal = jogatina.tempoInicio
            ? Math.floor((Date.now() - jogatina.tempoInicio) / 1000)
            : 0;

        const errosRelatorioFinais =
            jogatina.errosRelatorio + Number(errosRelatorioExtras || 0);

        const resposta = await fetch("http://localhost:3000/resultados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario: jogatina.idUsuario,
                dificuldade: jogatina.dificuldade,
                quantidade_casos: jogatina.quantidadeCasos,
                erros_desafio: jogatina.errosDesafio,
                erros_relatorio: errosRelatorioFinais,
                pontos: jogatina.pontos,
                tempo_segundos: tempoTotal
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao salvar o resultado.");
        }

        const dados = await resposta.json();

        setJogatina(prev => ({
            ...prev,
            errosRelatorio: errosRelatorioFinais,
            tempoSegundos: tempoTotal,
            dataFinalizacao: new Date().toISOString(),
            finalizada: true
        }));

        return dados;
    }

    return (
        <JogoContext.Provider value={{
            jogatina, iniciarJogatina, getDesafioAtual, aceitarDesafio,
            adicionarPontos, registrarErroDesafio, registrarErrosRelatorio,
            ehUltimoDesafio, proximoDesafio, finalizarJogatina
        }}>
            {children}
        </JogoContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useJogo() {
    const contexto = useContext(JogoContext);
    if (!contexto) {
        throw new Error("useJogo precisa estar dentro de JogoProvider.");
    }
    return contexto;
}