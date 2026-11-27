import { registrarTempoBancada } from "../../utils/tempoConquista";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./caso.module.css";        // estilos que o grupo já usa nos outros casos
import hd from "./casoHd.module.css";          // estilos reaproveitados do Caso 8 (botões, pop-up, zoom)
import bancada from "../../assets/bancada.jpeg";
import { useJogo } from "../../context/JogoContext";
import VisualizadorImagem from "./VisualizadorImagem";
import { ganharConquista } from "../../utils/ganharConquista";

const API = "http://localhost:3000";

const TEMPO_MENSAGEM_MS = 3500;
const CHAVE_MUNDOS_CONCLUIDOS = "repairsim_mundos_concluidos_v1";

const GABINETE_ABERTO_PADRAO = { caminho_imagem: "/imagens/gabinetes/gabinete_de_lado.png" };

const MENSAGEM_SUPERAQUECIMENTO = "O computador superaqueceu e desligou sozinho.";

function urlImagem(imagem) {
    if (!imagem?.caminho_imagem) {
        return "";
    }

    return `${API}${imagem.caminho_imagem}`;
}

<<<<<<< HEAD
function normalizarDificuldade(dificuldade) {
    return String(dificuldade || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function registrarDificuldadeConcluida(dificuldade) {
    const dif = normalizarDificuldade(dificuldade);
    let atual = {};
    try {
        atual = JSON.parse(window.localStorage.getItem(CHAVE_MUNDOS_CONCLUIDOS) || "{}");
    } catch {
        atual = {};
    }

    const estado = {
        Facil: Boolean(atual?.Facil) || dif === "facil",
        Medio: Boolean(atual?.Medio) || dif === "medio",
        Dificil: Boolean(atual?.Dificil) || dif === "dificil",
    };

    try {
        window.localStorage.setItem(CHAVE_MUNDOS_CONCLUIDOS, JSON.stringify(estado));
    } catch (erro) {
        console.warn("Não foi possível salvar progresso das dificuldades:", erro);
    }

    if (estado.Facil && estado.Medio && estado.Dificil) {
        ganharConquista("MESTRE_MUNDOS", "Mestre dos Três Mundos");
=======
function dispararConquistasConclusao(dificuldade, totalErros) {
    if (dificuldade === "Facil") {
        ganharConquista("TECNICO_INICIANTE", "Técnico Iniciante");
    } else if (dificuldade === "Medio") {
        ganharConquista("DIAGNOSTICO_MEDIO", "Diagnóstico Intermediário");
    } else if (dificuldade === "Dificil") {
        ganharConquista("ESPECIALISTA_BANCADA", "Especialista de Bancada");
        if (totalErros === 0) {
            ganharConquista("AUDITORIA_PERFEITA", "Auditoria Perfeita");
        }
>>>>>>> origin/dev-diego
    }
}

function CasoEtapas() {
    const navigate = useNavigate();
    const { jogatina, getDesafioAtual, adicionarPontos, registrarErroDesafio } = useJogo();

    const desafioAtual = getDesafioAtual();
    const idDesafio = desafioAtual?.id_desafio;

    const [imagensPc, setImagensPc] = useState([]);
    const [carregandoImagens, setCarregandoImagens] = useState(true);
    const [todosItens, setTodosItens] = useState([]);
    const [itensCarregados, setItensCarregados] = useState(false);

    const [etapas, setEtapas] = useState([]);
    const [totalEtapas, setTotalEtapas] = useState(0);
    const [carregandoEtapas, setCarregandoEtapas] = useState(true);
    const [erroCaso, setErroCaso] = useState("");

    const [etapa, setEtapa] = useState(1);

    const [config, setConfig] = useState({ pc_inicial: "ligado", desliga_sozinho_segundos: null });

    const [tipoSelecionado, setTipoSelecionado] = useState(null);
    const [categoriaAberta, setCategoriaAberta] = useState(false);

    const [pcLigado, setPcLigado] = useState(true);
    const [gabineteAberto, setGabineteAberto] = useState(false);

    const [verificandoItem, setVerificandoItem] = useState(false);
    const [respostaFinalizada, setRespostaFinalizada] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [popup, setPopup] = useState(null);
    const [imagemAmpliada, setImagemAmpliada] = useState(null);

<<<<<<< HEAD
    // Trava contra clique duplo e controle por caso
=======
>>>>>>> origin/dev-diego
    const verificandoRef = useRef(false);
    const conclusaoRegistradaRef = useRef(false);
    const errosCasoRef = useRef(0);
    const inicioCasoRef = useRef(Date.now());
    const temporizadorMensagem = useRef(null);
    const errosCasoRef = useRef(0);
    const abriuPainelRef = useRef(false);

    useEffect(() => {
        errosCasoRef.current = 0;
        abriuPainelRef.current = false;
    }, [idDesafio]);

    const mostrarMensagem = useCallback((texto, fixa = false) => {
        window.clearTimeout(temporizadorMensagem.current);
        setMensagem(texto);
        if (texto && !fixa) {
            temporizadorMensagem.current = window.setTimeout(() => setMensagem(""), TEMPO_MENSAGEM_MS);
        }
    }, []);
    useEffect(() => () => window.clearTimeout(temporizadorMensagem.current), []);

    useEffect(() => {
        if (!idDesafio) {
            return;
        }
        inicioCasoRef.current = Date.now();
        conclusaoRegistradaRef.current = false;
        errosCasoRef.current = 0;

        let cancelado = false;

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
    const monitorProblema = buscarImagem("monitor_problema");
    const gabineteLigado = buscarImagem("gabinete_ligado");
    const gabineteDesligado = buscarImagem("gabinete_desligado");

    const gabineteDefeito = imagensPc.find(
        imagem => imagem.funcao === "gabinete_empoeirado" || imagem.funcao?.endsWith("_defeito")
    );

    const gabineteLimpo = buscarImagem("gabinete_limpo", "gabinete_aberto_hd");

    const infoEtapaAtual = etapas.find(item => Number(item.ordem) === etapa);
    const modoDaEtapa = infoEtapaAtual?.modo ?? "hardware";

    const monitorDaEtapa = infoEtapaAtual?.funcao_monitor ? buscarImagem(infoEtapaAtual.funcao_monitor) : undefined;
    const gabineteDaEtapa = infoEtapaAtual?.funcao_gabinete ? buscarImagem(infoEtapaAtual.funcao_gabinete) : undefined;
    const modoUltimaEtapa = etapas.find(item => Number(item.ordem) === totalEtapas)?.modo ?? "hardware";

    let imagemMonitorAtual;

    if (!pcLigado) {
        imagemMonitorAtual = monitorDesligado;
    }
    else if (respostaFinalizada) {
        imagemMonitorAtual = monitorLigado;
    }
    else {
        imagemMonitorAtual = monitorDaEtapa ?? monitorProblema ?? monitorLigado;
    }

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

    function abrirOuAmpliarGabinete() {
        if (respostaFinalizada) {
            return;
        }

        if (pcLigado) {
            mostrarMensagem("Desligue o computador antes de abrir o gabinete.");
            return;
        }

        if (!gabineteAberto) {
            setGabineteAberto(true);
            mostrarMensagem("Gabinete aberto.");
            return;
        }

        const imagemZoom = imagemGabineteAtual;

        if (imagemZoom) {
            setImagemAmpliada({ src: urlImagem(imagemZoom), alt: "Interior do gabinete" });
        }
    }

    function fecharGabinete() {
        setGabineteAberto(false);
        mostrarMensagem("Gabinete fechado.");
    }

    function ampliarImagem(imagem, alt) {
        if (!imagem) {
            return;
        }

        setImagemAmpliada({ src: urlImagem(imagem), alt });
    }

    function abrirCategoria(tipo) {
        if (respostaFinalizada || verificandoItem) {
            return;
        }

        if (categoriaAberta && tipoSelecionado === tipo) {
            setCategoriaAberta(false);
        }
        else {
            abriuPainelRef.current = true;
            setTipoSelecionado(tipo);
            setCategoriaAberta(true);
            ganharConquista("MAO_NA_MASSA", "Mão na Massa");
        }
    }

    async function usarItem(item) {
        if (verificandoRef.current || respostaFinalizada) {
            return;
        }

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

        if (abriuPainelRef.current) {
            ganharConquista("MAO_NA_MASSA", "Mão na Massa");
        }

        verificandoRef.current = true;
        setVerificandoItem(true);
        mostrarMensagem("Verificando item...", true);

        try {
            const resposta = await fetch(`${API}/desafios/${idDesafio}/verificar`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_item: item.id_item, ordem: etapa })
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || "Erro ao verificar o item.");
            }

            adicionarPontos(Number(resultado.pontos || 0));

            if (!resultado.correto) {
                errosCasoRef.current += 1;
                registrarErroDesafio();
                mostrarMensagem("❌ " + resultado.mensagem);
                return;
            }

            if (etapa < totalEtapas) {
                setEtapa(etapa + 1);
                mostrarMensagem("");
                setPopup({
                    titulo: `Etapa ${etapa} concluída!`,
                    texto: "Você acertou. Continue o reparo."
                });
                return;
            }

            setRespostaFinalizada(true);
            setCategoriaAberta(false);

<<<<<<< HEAD
            if (!conclusaoRegistradaRef.current) {
                conclusaoRegistradaRef.current = true;
                const segundosGastos = Math.max(1, Math.round((Date.now() - inicioCasoRef.current) / 1000));
                const dif = normalizarDificuldade(desafioAtual?.dificuldade);

                registrarTempoBancada(desafioAtual?.dificuldade, segundosGastos);
                registrarDificuldadeConcluida(desafioAtual?.dificuldade);

                if (dif === "facil") {
                    ganharConquista("TECNICO_INICIANTE", "Técnico Iniciante");
                } else if (dif === "medio") {
                    ganharConquista("DIAGNOSTICO_MEDIO", "Diagnóstico Intermediário");
                } else if (dif === "dificil") {
                    ganharConquista("ESPECIALISTA_BANCADA", "Especialista de Bancada");
                    if (errosCasoRef.current === 0) {
                        ganharConquista("AUDITORIA_PERFEITA", "Auditoria Perfeita");
                    }
                }
            }
=======
            dispararConquistasConclusao(desafioAtual?.dificuldade, errosCasoRef.current);
>>>>>>> origin/dev-diego

            if (modoUltimaEtapa === "software") {
                mostrarMensagem("Reparo concluído com sucesso.", true);
            }
            else {
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
    const mostrarRelatorio = respostaFinalizada && !gabineteAberto;
    const itensDaCategoria = todosItens.filter(item => item.tipo === tipoSelecionado);

    return (
        <div className={styles.screenWrapper}>
            <div className={styles.mainContainer}>

                <div className={styles.statusJogo}>
                    <span>Caso {jogatina.indiceAtual + 1} / {jogatina.quantidadeCasos}</span>
                    <span>Pontos: {jogatina.pontos}</span>
                </div>

                <img src={bancada} alt="Bancada de manutenção" className={styles.bancada} />

                <button type="button" className={styles.btnVoltar} onClick={() => navigate("/")}>
                    VOLTAR
                </button>

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

                {!gabineteAberto && !respostaFinalizada && (
                    <button
                        type="button"
                        className={pcLigado ? styles.btnDesligar : hd.btnLigar}
                        onClick={alternarEnergia}
                    >
                        {pcLigado ? "DESLIGAR" : "LIGAR"}
                    </button>
                )}

                {gabineteAberto && (
                    <button type="button" className={hd.btnFecharGabinete} onClick={fecharGabinete}>
                        FECHAR GABINETE
                    </button>
                )}

                {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

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

                {mostrarRelatorio && (
                    <button
                        type="button"
                        className={styles.btnRelatorio}
                        onClick={() => navigate(`/relatorio/${idDesafio}`)}
                    >
                        IR PARA RELATÓRIO
                    </button>
                )}

                {imagemAmpliada && (
                    <VisualizadorImagem
                        src={imagemAmpliada.src}
                        alt={imagemAmpliada.alt}
                        closeLabel="VOLTAR AO COMPUTADOR"
                        onClose={() => setImagemAmpliada(null)}
                    />
                )}

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