import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./caso.module.css";        // estilos que o grupo já usa nos outros casos
import hd from "./casoHd.module.css";          // estilos reaproveitados do Caso 8 (botões, pop-up, zoom)
import bancada from "../../assets/bancada.jpeg";
import { useJogo } from "../../context/JogoContext";
import VisualizadorImagem from "./VisualizadorImagem";
import { ganharConquista } from "../../utils/ganharConquista"; // conquistas (arquivo que veio da main do Diego)

// CASO COM ETAPAS (serve para Fácil = 1 etapa, Médio = 2 etapas e, no futuro, Difícil = 3).
// É o CasoHd sem as partes do HD: a quantidade de etapas e ONDE cada uma acontece vêm do backend (GET /desafios/:id/etapas).
//   modo "software" -> computador LIGADO e gabinete FECHADO
//   modo "hardware" -> computador DESLIGADO e gabinete ABERTO

// Endereço do servidor (o mesmo usado no restante do projeto).
const API = "http://localhost:3000";

const TEMPO_MENSAGEM_MS = 3500;

// Gabinete aberto de lado e limpo, usado SÓ se o caso não tiver nenhuma imagem de gabinete aberto cadastrada.
// (Antes, casos sem essa imagem, como os casos 6 e 7, mostravam "Imagem do gabinete não cadastrada" ao abrir o gabinete.)
const GABINETE_ABERTO_PADRAO = { caminho_imagem: "/imagens/gabinetes/gabinete_de_lado.png" };

// texto quando o computador desliga sozinho (casos com "desliga_sozinho_segundos", como o caso 4)
const MENSAGEM_SUPERAQUECIMENTO = "O computador superaqueceu e desligou sozinho.";

// Monta a URL completa de uma imagem que veio do banco.
function urlImagem(imagem) {
    if (!imagem?.caminho_imagem) {
        return "";
    }

    return `${API}${imagem.caminho_imagem}`;
}

function CasoEtapas() {
    const navigate = useNavigate();
    const { jogatina, getDesafioAtual, adicionarPontos, registrarErroDesafio } = useJogo();

    const desafioAtual = getDesafioAtual();
    const idDesafio = desafioAtual?.id_desafio;

    // ----------------------- ESTADOS -----------------------

    // Dados vindos do backend
    const [imagensPc, setImagensPc] = useState([]);
    const [carregandoImagens, setCarregandoImagens] = useState(true);
    const [todosItens, setTodosItens] = useState([]);
    const [itensCarregados, setItensCarregados] = useState(false);

    // Etapas do caso (GET /desafios/:id/etapas)
    const [etapas, setEtapas] = useState([]);
    const [totalEtapas, setTotalEtapas] = useState(0);
    const [carregandoEtapas, setCarregandoEtapas] = useState(true);
    const [erroCaso, setErroCaso] = useState(""); // caso mal configurado ou falha ao buscar as etapas

    // Etapa atual (começa em 1). O número da etapa é enviado ao backend como "ordem".
    const [etapa, setEtapa] = useState(1);

    // Comportamento do computador neste caso (vem do backend em /etapas):
    //  pc_inicial = "ligado" ou "desligado" | desliga_sozinho_segundos = se ligar o PC, ele desliga sozinho depois de X segundos
    const [config, setConfig] = useState({ pc_inicial: "ligado", desliga_sozinho_segundos: null });

    // Menu de itens
    const [tipoSelecionado, setTipoSelecionado] = useState(null);
    const [categoriaAberta, setCategoriaAberta] = useState(false);

    // Estado do computador (energia e gabinete são independentes)
    const [pcLigado, setPcLigado] = useState(true);
    const [gabineteAberto, setGabineteAberto] = useState(false);

    // Controles da interface
    const [verificandoItem, setVerificandoItem] = useState(false);
    const [respostaFinalizada, setRespostaFinalizada] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [popup, setPopup] = useState(null);
    const [imagemAmpliada, setImagemAmpliada] = useState(null);

    // Trava contra clique duplo: o estado só muda no próximo render, a ref muda na hora.
    const verificandoRef = useRef(false);
    const temporizadorMensagem = useRef(null);

    const mostrarMensagem = useCallback((texto, fixa = false) => {
        window.clearTimeout(temporizadorMensagem.current);
        setMensagem(texto);
        if (texto && !fixa) {
            temporizadorMensagem.current = window.setTimeout(() => setMensagem(""), TEMPO_MENSAGEM_MS);
        }
    }, []);
    useEffect(() => () => window.clearTimeout(temporizadorMensagem.current), []);

    // ----------------------- BUSCAS NO BACKEND -----------------------

    // Etapas do caso: quantas são e onde cada uma acontece
    useEffect(() => {
        // sem desafio na memória a tela já redireciona para /dificuldade (ver mais abaixo)
        if (!idDesafio) {
            return;
        }

        // o caso é remontado a cada desafio novo (key no caso.jsx), então os estados já começam "carregando"
        let cancelado = false; // evita atualizar o estado se a tela já foi fechada

        // credentials: "include" envia o cookie de login (os casos exclusivos de instituição respondem 404 sem ele)
        fetch(`${API}/desafios/${idDesafio}/etapas`, { credentials: "include" })
            .then(async resposta => {
                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(dados.mensagem || "Erro ao buscar as etapas do caso.");
                }

                return dados;
            })
            .then(dados => {
                if (cancelado) {
                    return;
                }

                if (!dados.valido) {
                    console.error("Caso fora da regra de etapas:", dados.motivo);
                    setErroCaso("Este caso está mal configurado e não pode ser jogado. Avise o responsável pelo sistema.");
                    return;
                }

                setTotalEtapas(Number(dados.total_etapas));
                setEtapas(Array.isArray(dados.etapas) ? dados.etapas : []);
                setEtapa(1);

                // o caso 4, por exemplo, começa com o computador DESLIGADO e desliga sozinho se for ligado
                const configDoCaso = {
                    pc_inicial: dados.config?.pc_inicial === "desligado" ? "desligado" : "ligado",
                    desliga_sozinho_segundos: Number(dados.config?.desliga_sozinho_segundos) || null
                };
                setConfig(configDoCaso);
                setPcLigado(configDoCaso.pc_inicial !== "desligado");
            })
            .catch(erro => {
                console.error("Erro ao carregar as etapas:", erro);
                if (!cancelado) {
                    setErroCaso(erro.message || "Não foi possível carregar as etapas do caso.");
                }
            })
            .finally(() => {
                if (!cancelado) {
                    setCarregandoEtapas(false);
                }
            });

        return () => {
            cancelado = true;
        };
    }, [idDesafio]);

    // Imagens do computador neste desafio
    useEffect(() => {
        if (!idDesafio) {
            return;
        }

        let cancelado = false;

        fetch(`${API}/desafio-imagens-pc/desafio/${idDesafio}`, { credentials: "include" })
            .then(resposta => {
                if (!resposta.ok) {
                    throw new Error("Erro ao buscar as imagens do computador.");
                }
                return resposta.json();
            })
            .then(dados => {
                if (!cancelado) {
                    setImagensPc(Array.isArray(dados) ? dados : []);
                }
            })
            .catch(erro => {
                console.error("Erro ao carregar as imagens do caso:", erro);
                if (!cancelado) {
                    mostrarMensagem("Não foi possível carregar as imagens do computador.");
                }
            })
            .finally(() => {
                if (!cancelado) {
                    setCarregandoImagens(false);
                }
            });

        return () => {
            cancelado = true;
        };
    }, [idDesafio, mostrarMensagem]);

    // Todos os itens, uma única vez (a categoria é filtrada na tela, sem buscar de novo a cada troca)
    useEffect(() => {
        let cancelado = false;

        fetch(`${API}/itens`)
            .then(resposta => {
                if (!resposta.ok) {
                    throw new Error("Erro ao buscar os itens.");
                }
                return resposta.json();
            })
            .then(dados => {
                if (!cancelado) {
                    setTodosItens(Array.isArray(dados) ? dados : []);
                    setItensCarregados(true);
                }
            })
            .catch(erro => {
                console.error("Erro ao carregar os itens:", erro);
                if (!cancelado) {
                    setItensCarregados(true);
                    mostrarMensagem("Não foi possível carregar os itens.");
                }
            });

        return () => {
            cancelado = true;
        };
    }, [mostrarMensagem]);

    // DESLIGA SOZINHO (superaquecimento): enquanto o PC estiver ligado e o caso não terminou, conta os segundos.
    // Se o jogador desligar antes (ou o caso terminar), a contagem é cancelada.
    useEffect(() => {
        const segundos = config.desliga_sozinho_segundos;

        if (!pcLigado || respostaFinalizada || !segundos) {
            return;
        }

        const temporizador = window.setTimeout(() => {
            setPcLigado(false);
            mostrarMensagem(MENSAGEM_SUPERAQUECIMENTO);
        }, segundos * 1000);

        return () => window.clearTimeout(temporizador);
    }, [pcLigado, respostaFinalizada, config.desliga_sozinho_segundos, mostrarMensagem]);

    // ----------------------- IMAGENS DO PC -----------------------

    // Procura uma imagem pela "funcao" cadastrada em desafio_imagens_pc.
    // Os nomes são testados NA ORDEM em que foram passados (o primeiro que existir vence).
    function buscarImagem(...funcoes) {
        for (const funcao of funcoes) {
            const imagem = imagensPc.find(item => item.funcao === funcao);

            if (imagem) {
                return imagem;
            }
        }

        return undefined;
    }

    const monitorLigado = buscarImagem("monitor_ligado");
    const monitorDesligado = buscarImagem("monitor_desligado");
    const monitorProblema = buscarImagem("monitor_problema"); // imagem do problema de software (casos exclusivos)
    const gabineteLigado = buscarImagem("gabinete_ligado");
    const gabineteDesligado = buscarImagem("gabinete_desligado");

    // Gabinete ABERTO mostrando o defeito do caso (mesma regra do caso.jsx):
    // "gabinete_empoeirado" (caso 1) ou qualquer função terminada em "_defeito" (ex: gabinete_ram_defeito, gabinete_fonte_defeito)
    const gabineteDefeito = imagensPc.find(
        imagem => imagem.funcao === "gabinete_empoeirado" || imagem.funcao?.endsWith("_defeito")
    );

    // Gabinete aberto e LIMPO (no Caso 8 essa mesma imagem genérica se chama gabinete_aberto_hd)
    const gabineteLimpo = buscarImagem("gabinete_limpo", "gabinete_aberto_hd");

    // ----------------------- REGRAS DA ETAPA -----------------------

    // modo da etapa atual e da última etapa (software ou hardware)
    const infoEtapaAtual = etapas.find(item => Number(item.ordem) === etapa);
    const modoDaEtapa = infoEtapaAtual?.modo ?? "hardware";

    // Imagens ESPECÍFICAS da etapa atual (monitor_etapa_N / gabinete_etapa_N), se o caso tiver.
    // Ex.: caso 5, etapa 1 = gabinete com faíscas (aviso); etapa 2 = fonte queimada. Caso 6, etapa 2 = monitor com "HD cheio".
    const monitorDaEtapa = infoEtapaAtual?.funcao_monitor ? buscarImagem(infoEtapaAtual.funcao_monitor) : undefined;
    const gabineteDaEtapa = infoEtapaAtual?.funcao_gabinete ? buscarImagem(infoEtapaAtual.funcao_gabinete) : undefined;
    const modoUltimaEtapa = etapas.find(item => Number(item.ordem) === totalEtapas)?.modo ?? "hardware";

    // Qual imagem do MONITOR aparece agora?
    let imagemMonitorAtual;

    if (!pcLigado) {
        imagemMonitorAtual = monitorDesligado;
    }
    else if (respostaFinalizada) {
        imagemMonitorAtual = monitorLigado; // problema resolvido: monitor volta ao normal
    }
    else {
        imagemMonitorAtual = monitorDaEtapa ?? monitorProblema ?? monitorLigado;
    }

    // Qual imagem do GABINETE aparece agora?
    let imagemGabineteAtual;

    if (gabineteAberto) {
        imagemGabineteAtual = respostaFinalizada
            ? (gabineteLimpo ?? gabineteDefeito ?? GABINETE_ABERTO_PADRAO)
            : (gabineteDaEtapa ?? gabineteDefeito ?? gabineteLimpo ?? GABINETE_ABERTO_PADRAO);
    }
    else if (pcLigado) {
        imagemGabineteAtual = gabineteLigado;
    }
    else {
        imagemGabineteAtual = gabineteDesligado;
    }

    // ----------------------- AÇÕES DO JOGADOR -----------------------

    // Botão LIGAR / DESLIGAR
    function alternarEnergia() {
        if (respostaFinalizada) {
            return;
        }

        if (gabineteAberto) {
            mostrarMensagem("Feche o gabinete antes de ligar o computador.");
            return;
        }

        setPcLigado(!pcLigado);
        mostrarMensagem(pcLigado ? "Computador desligado." : "Computador ligado.");
    }

    // Clicar no gabinete: só abre com o PC desligado; o segundo clique amplia a imagem
    function abrirOuAmpliarGabinete() {
        if (respostaFinalizada) {
            return;
        }

        if (pcLigado) {
            mostrarMensagem("Desligue o computador antes de abrir o gabinete.");
            return;
        }

        // Primeiro clique: só abre (não dá zoom)
        if (!gabineteAberto) {
            setGabineteAberto(true);
            mostrarMensagem("Gabinete aberto.");
            return;
        }

        // Segundo clique: amplia a imagem do defeito
        const imagemZoom = imagemGabineteAtual; // amplia exatamente a imagem que está na tela (inclusive a da etapa)

        if (imagemZoom) {
            setImagemAmpliada({ src: urlImagem(imagemZoom), alt: "Interior do gabinete" });
        }
    }

    function fecharGabinete() {
        setGabineteAberto(false);
        mostrarMensagem("Gabinete fechado.");
    }

    // Clicar no monitor: abre a imagem ampliada
    function ampliarImagem(imagem, alt) {
        if (!imagem) {
            return;
        }

        setImagemAmpliada({ src: urlImagem(imagem), alt });
    }

    // O menu de categorias fica sempre clicável: o estado do PC só é conferido na hora de usar o item.
    function abrirCategoria(tipo) {
        if (respostaFinalizada || verificandoItem) {
            return;
        }

        if (categoriaAberta && tipoSelecionado === tipo) {
            setCategoriaAberta(false);
        }
        else {
            setTipoSelecionado(tipo);
            setCategoriaAberta(true);
        }
    }

    // Clicar em um item: confere se o computador está no estado certo
    // e depois pergunta ao backend se o item está certo PARA ESTA ETAPA.
    async function usarItem(item) {
        if (verificandoRef.current || respostaFinalizada) {
            return;
        }

        // Etapa de software: PC ligado e gabinete fechado
        if (modoDaEtapa === "software") {
            if (!pcLigado) {
                mostrarMensagem("Ligue o computador para executar esta ação.");
                return;
            }

            if (gabineteAberto) {
                mostrarMensagem("Feche o gabinete antes de utilizar o software.");
                return;
            }
        }

        // Etapa de hardware: PC desligado e gabinete aberto
        if (modoDaEtapa === "hardware") {
            if (pcLigado) {
                mostrarMensagem("Desligue o computador antes de mexer nas peças.");
                return;
            }

            if (!gabineteAberto) {
                mostrarMensagem("Abra o gabinete antes de mexer nas peças.");
                return;
            }
        }

        verificandoRef.current = true;
        setVerificandoItem(true);
        mostrarMensagem("Verificando item...", true); // true = a mensagem não some sozinha

        try {
            const resposta = await fetch(`${API}/desafios/${idDesafio}/verificar`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                // "ordem" é a etapa atual: o backend só aceita o item se ele
                // estiver cadastrado em desafio_itens com essa ordem.
                body: JSON.stringify({ id_item: item.id_item, ordem: etapa })
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || "Erro ao verificar o item.");
            }

            // +10 se acertou, -5 se errou
            adicionarPontos(Number(resultado.pontos || 0));

            // Item errado: continua na mesma etapa para tentar de novo
            if (!resultado.correto) {
                registrarErroDesafio();
                mostrarMensagem("❌ " + resultado.mensagem);
                return;
            }

            // Acertou uma etapa que NÃO é a última: avança e avisa
            if (etapa < totalEtapas) {
                setEtapa(etapa + 1);
                mostrarMensagem("");
                setPopup({
                    titulo: `Etapa ${etapa} concluída!`,
                    texto: "Você acertou. Continue o reparo."
                });
                return;
            }

            // Última etapa: fim do caso
            setRespostaFinalizada(true);
            setCategoriaAberta(false);

            // Conquista "Técnico Iniciante": mesma regra que o Diego colocou no CasoPadrao (caso fácil concluído).
            // Os casos fáceis agora abrem este componente, então o gatilho precisa estar aqui também.
            if (desafioAtual?.dificuldade === "Facil") {
                ganharConquista("TECNICO_INICIANTE", "Técnico Iniciante");
            }

            if (modoUltimaEtapa === "software") {
                // Software: o monitor volta ao normal e o botão do relatório aparece na hora
                mostrarMensagem("Reparo concluído com sucesso.", true);
            }
            else {
                // Hardware: o gabinete continua aberto e limpo; o jogador precisa fechá-lo para seguir.
                // O PC não liga nem desliga sozinho.
                mostrarMensagem("Reparo concluído! Feche o gabinete para continuar.", true);
            }
        }
        catch (erro) {
            console.error("Erro ao executar a ação do caso:", erro);
            mostrarMensagem(erro.message || "Não foi possível verificar o item.");
        }
        finally {
            verificandoRef.current = false;
            setVerificandoItem(false);
        }
    }

    // ----------------------- TELA -----------------------

    // Todos os hooks ficam ACIMA deste return (regra dos hooks do React).
    // Sem desafio na memória (ex.: F5 no meio da partida): volta para a escolha de dificuldade.
    if (!desafioAtual) {
        return <Navigate to="/dificuldade" replace />;
    }

    if (erroCaso) {
        return (
            <div className={styles.screenWrapper}>
                <div className={styles.mainContainer}>
                    <p className={hd.placeholderPcImage} role="alert">{erroCaso}</p>
                    <button type="button" className={styles.btnVoltar} onClick={() => navigate("/")}>
                        VOLTAR
                    </button>
                </div>
            </div>
        );
    }

    const menuBloqueado = respostaFinalizada || verificandoItem;

    // O relatório aparece: (software) na hora; (hardware) só depois de fechar o gabinete
    const mostrarRelatorio = respostaFinalizada && !gabineteAberto;

    const itensDaCategoria = todosItens.filter(item => item.tipo === tipoSelecionado);

    return (
        <div className={styles.screenWrapper}>
            <div className={styles.mainContainer}>

                {/* Status da jogatina */}
                <div className={styles.statusJogo}>
                    <span>Caso {jogatina.indiceAtual + 1} / {jogatina.quantidadeCasos}</span>
                    <span>Pontos: {jogatina.pontos}</span>
                </div>

                <img src={bancada} alt="Bancada de manutenção" className={styles.bancada} />

                <button type="button" className={styles.btnVoltar} onClick={() => navigate("/")}>
                    VOLTAR
                </button>

                {/* Computador na bancada */}
                <div className={styles.pcContainer}>
                    {imagemMonitorAtual && !carregandoEtapas ? (
                        <img
                            src={urlImagem(imagemMonitorAtual)}
                            alt="Monitor"
                            className={`${styles.monitorImage} ${hd.imagemZoomClicavel}`}
                            onClick={() => ampliarImagem(imagemMonitorAtual, "Monitor ampliado")}
                        />
                    ) : (
                        !carregandoImagens && !carregandoEtapas && (
                            <p className={hd.placeholderPcImage}>Imagem do monitor não cadastrada.</p>
                        )
                    )}

                    {imagemGabineteAtual && !carregandoEtapas ? (
                        <img
                            src={urlImagem(imagemGabineteAtual)}
                            alt="Gabinete do computador"
                            className={`${styles.gabineteImage} ${gabineteAberto ? hd.imagemZoomClicavel : hd.imagemAbrivel}`}
                            onClick={abrirOuAmpliarGabinete}
                        />
                    ) : (
                        !carregandoImagens && !carregandoEtapas && (
                            <p className={hd.placeholderPcImage}>Imagem do gabinete não cadastrada.</p>
                        )
                    )}
                </div>

                {/* Ligar / desligar (some com o gabinete aberto e no fim do caso) */}
                {!gabineteAberto && !respostaFinalizada && (
                    <button
                        type="button"
                        className={pcLigado ? styles.btnDesligar : hd.btnLigar}
                        onClick={alternarEnergia}
                    >
                        {pcLigado ? "DESLIGAR" : "LIGAR"}
                    </button>
                )}

                {/* Fechar gabinete: continua visível mesmo depois de finalizar o caso */}
                {gabineteAberto && (
                    <button type="button" className={hd.btnFecharGabinete} onClick={fecharGabinete}>
                        FECHAR GABINETE
                    </button>
                )}

                {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

                {/* Categorias e itens */}
                <div className={styles.toolsContainer}>
                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorTool} ${categoriaAberta && tipoSelecionado === "ferramenta" ? styles.active : ""}`}
                        disabled={menuBloqueado}
                        onClick={() => abrirCategoria("ferramenta")}
                    >
                        FERRAMENTAS
                    </button>

                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorComp} ${categoriaAberta && tipoSelecionado === "peca" ? styles.active : ""}`}
                        disabled={menuBloqueado}
                        onClick={() => abrirCategoria("peca")}
                    >
                        PEÇAS
                    </button>

                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorSoft} ${categoriaAberta && tipoSelecionado === "software" ? styles.active : ""}`}
                        disabled={menuBloqueado}
                        onClick={() => abrirCategoria("software")}
                    >
                        SOFTWARE
                    </button>

                    {categoriaAberta && !respostaFinalizada && (
                        <div className={hd.toolsBoxSemRolagem}>
                            <h3 className={styles.titleTools}>
                                {tipoSelecionado === "ferramenta" && "Ferramentas"}
                                {tipoSelecionado === "peca" && "Peças"}
                                {tipoSelecionado === "software" && "Software"}
                            </h3>

                            <div className={styles.contentTools}>
                                {!itensCarregados || carregandoEtapas ? (
                                    <p>Carregando itens...</p>
                                ) : itensDaCategoria.length === 0 ? (
                                    <p>Nenhum item nesta categoria.</p>
                                ) : (
                                    itensDaCategoria.map(item => (
                                        <button
                                            type="button"
                                            key={item.id_item}
                                            className={hd.itemCard}
                                            disabled={menuBloqueado}
                                            title={item.nome}
                                            aria-label={item.nome}
                                            onClick={() => usarItem(item)}
                                        >
                                            <img src={urlImagem(item)} className={styles.imgItem} alt={item.nome} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* O relatório só é liberado no fim do caso (e, no hardware, com o gabinete fechado) */}
                {mostrarRelatorio && (
                    <button
                        type="button"
                        className={styles.btnRelatorio}
                        onClick={() => navigate(`/relatorio/${idDesafio}`)}
                    >
                        IR PARA RELATÓRIO
                    </button>
                )}

                {/* Imagem ampliada */}
                {imagemAmpliada && (
                    <VisualizadorImagem
                        src={imagemAmpliada.src}
                        alt={imagemAmpliada.alt}
                        closeLabel="VOLTAR AO COMPUTADOR"
                        onClose={() => setImagemAmpliada(null)}
                    />
                )}

                {/* Pop-up de etapa concluída (textos fixos do front) */}
                {popup && (
                    <div className={hd.overlayPopup} role="presentation">
                        <section
                            className={hd.popupCard}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="titulo-popup-etapa"
                        >
                            <h2 id="titulo-popup-etapa">{popup.titulo}</h2>
                            <p>{popup.texto}</p>
                            <button type="button" className={hd.botaoPopup} onClick={() => setPopup(null)}>
                                CONTINUAR
                            </button>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CasoEtapas;
