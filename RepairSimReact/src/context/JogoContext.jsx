import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, lerUsuario, limparSessao } from "../services/auth";
import { ganharConquista } from "../utils/ganharConquista";

const JogoContext = createContext(null);

// A partida fica guardada no sessionStorage (some ao fechar a aba) para sobreviver ao F5 no meio do jogo.
const CHAVE_PARTIDA = "repairsim_jogatina";
const META_SEGUNDOS_10MIN = 600;
const CHAVE_PLANTAO_DISPARADO = "repairsim_plantao_10min_disparado_v1";
const CHAVE_MESTRE_DISPARADO = "repairsim_mestre_mundos_disparado_v1";

const ESTADO_INICIAL = {
    salvo: false,
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
    finalizada: false,
    estrelas: null,  // nota de 0 a 5 calculada pelo servidor ao salvar o resultado (null = sem nota)
    idPartida: null, // partida registrada no servidor (casos exclusivos jogados por aluno numa sala)
    teste: false     // professor testando os próprios casos: nada é salvo
};

function normalizarDificuldade(dif) {
    const limpa = String(dif || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (limpa === "medio") return "Medio";
    if (limpa === "dificil") return "Dificil";
    return "Facil";
}

async function verificarConquistasPorHistorico(dificuldadeAtual = null, tempoPartidaAtual = 0) {
    if (!lerUsuario()) return;

    let partidasHistorico = [];
    try {
        const resp = await fetch(`${API_URL}/resultados/meus`, { credentials: "include" });
        if (resp.ok) {
            const dados = await resp.json();
            partidasHistorico = Array.isArray(dados?.partidas) ? dados.partidas : [];
        }
    } catch {
        // se falhar ao buscar histórico, ainda avalia os dados da partida atual
    }

    const tempoHistorico = partidasHistorico.reduce((soma, p) => {
        const seg = Number(p?.tempo_segundos || 0);
        return soma + (Number.isFinite(seg) && seg > 0 ? seg : 0);
    }, 0);

    const extraTempo = Number.isFinite(Number(tempoPartidaAtual)) && Number(tempoPartidaAtual) > 0
        ? Number(tempoPartidaAtual)
        : 0;

    // Usa o maior valor para não duplicar caso a última partida já esteja no histórico
    const totalSegundos = Math.max(tempoHistorico, tempoHistorico + extraTempo);

    if (totalSegundos >= META_SEGUNDOS_10MIN && localStorage.getItem(CHAVE_PLANTAO_DISPARADO) !== "true") {
        localStorage.setItem(CHAVE_PLANTAO_DISPARADO, "true");
        ganharConquista("PLANTAO_10MIN", "Plantão de 10 Minutos");
    }

    const dificuldadesJogadas = new Set(
        partidasHistorico
            .map(p => normalizarDificuldade(p?.dificuldade))
            .filter(Boolean)
    );
    if (dificuldadeAtual) {
        dificuldadesJogadas.add(normalizarDificuldade(dificuldadeAtual));
    }

    const completouTresDificuldades =
        dificuldadesJogadas.has("Facil") &&
        dificuldadesJogadas.has("Medio") &&
        dificuldadesJogadas.has("Dificil");

    if (completouTresDificuldades && localStorage.getItem(CHAVE_MESTRE_DISPARADO) !== "true") {
        localStorage.setItem(CHAVE_MESTRE_DISPARADO, "true");
        ganharConquista("MESTRE_MUNDOS", "Mestre dos Três Mundos");
    }
}

function lerPartidaSalva() {
    try {
        const texto = sessionStorage.getItem(CHAVE_PARTIDA);
        if (!texto) return null;

        const dados = JSON.parse(texto);
        return dados && Array.isArray(dados.desafios) ? { ...ESTADO_INICIAL, ...dados } : null;
    } catch {
        return null; // navegador sem sessionStorage (modo privado) ou conteúdo estragado
    }
}

export function JogoProvider({ children }) {

    const [jogatina, setJogatina] = useState(() => lerPartidaSalva() ?? ESTADO_INICIAL);

    useEffect(() => {
        if (lerUsuario()) {
            verificarConquistasPorHistorico();
        }
    }, []);

    useEffect(() => {
        try {
            sessionStorage.setItem(CHAVE_PARTIDA, JSON.stringify(jogatina));
        } catch {
            // sem armazenamento: o jogo funciona igual, só não sobrevive ao F5
        }
    }, [jogatina]);

    // extra (só nos casos exclusivos): { idPartida, teste }
    function iniciarJogatina(dificuldade, desafiosSelecionados, extra = {}) {
        if (desafiosSelecionados.length === 0) {
            console.error("Nenhum desafio selecionado.");
            return;
        }

        setJogatina({
            salvo: false,
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
            finalizada: false,
            estrelas: null,
            idPartida: extra.idPartida ?? null,
            teste: Boolean(extra.teste)
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
    async function finalizarJogatina(errosRelatorioExtras = 0, quantidadeCasosOverride = null) {
        // -----------------------------------------------------
        // Calcula quanto tempo passou desde o início da jogatina
        // -----------------------------------------------------
        const tempoTotal = jogatina.tempoInicio ? Math.floor((Date.now() - jogatina.tempoInicio) / 1000) : 0;
        // -----------------------------------------------------
        // Soma os erros do último relatório, caso existam
        // -----------------------------------------------------
        const errosRelatorioFinais = jogatina.errosRelatorio + Number(errosRelatorioExtras || 0);
        // -----------------------------------------------------
        // Quantidade de casos concluídos
        //
        // Normal:
        //   usa jogatina.quantidadeCasos = 10
        //
        // Recusou:
        //   recebe uma quantidade específica, por exemplo 2
        // -----------------------------------------------------

        const quantidadeCasosFinal = quantidadeCasosOverride !== null ? quantidadeCasosOverride : jogatina.quantidadeCasos;

        // -----------------------------------------------------
        // Salva o resultado SOMENTE se houver um usuário logado.
        // O backend identifica o jogador pelo cookie de login (não enviamos mais id_usuario).
        // Sem login a partida termina normalmente, mas nada é salvo.
        // -----------------------------------------------------
        let idResultado = null;
        let salvo = false;
        let estrelas = null;

        // professor testando (teste = true): a partida não é salva em lugar nenhum
        if (lerUsuario() && !jogatina.teste) {
            const resposta = await fetch(`${API_URL}/resultados`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dificuldade: jogatina.dificuldade,
                        quantidade_casos: quantidadeCasosFinal,
                        erros_desafio: jogatina.errosDesafio,
                        erros_relatorio: errosRelatorioFinais,
                        pontos: jogatina.pontos,
                        tempo_segundos: tempoTotal,
                        ...(jogatina.idPartida ? { id_partida: jogatina.idPartida } : {})
                    })
                }
            );

            if (resposta.status === 401) {
                // o login expirou durante a partida: encerra a jogatina sem salvar
                limparSessao();
            } else if (!resposta.ok) {
                throw new Error("Erro ao salvar o resultado.");
            } else {
                const dados = await resposta.json();
                idResultado = dados.id_resultado;
                estrelas = dados.estrelas ?? null;
                salvo = true;
            }
        }

        // -----------------------------------------------------
        // Atualiza o contexto
        // -----------------------------------------------------

        setJogatina(prev => ({
            ...prev,
            quantidadeCasos: quantidadeCasosFinal,
            errosRelatorio: errosRelatorioFinais,
            tempoSegundos: tempoTotal,
            dataFinalizacao: new Date().toISOString(),
            finalizada: true,
            salvo,
            idResultado,
            estrelas
        }));

        if (lerUsuario() && !jogatina.teste) {
            await verificarConquistasPorHistorico(jogatina.dificuldade, tempoTotal);
        }

        return { id_resultado: idResultado, salvo };
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