import { registrarTempoBancada } from "../../utils/tempoConquista";
import { ganharConquista } from "../../utils/ganharConquista";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./caso.module.css";        // estilos que o grupo já usa nos outros casos
import hd from "./casoHd.module.css";          // estilos exclusivos do Caso 8
import bancada from "../../assets/bancada.jpeg";
import { useJogo } from "../../context/JogoContext";
import VisualizadorImagem from "../../pages/caso/VisualizadorImagem";

const API = "http://localhost:3000";

const PORCENTAGENS_BACKUP = [0, 25, 50, 75, 100];
const ULTIMO_INDICE_BACKUP = PORCENTAGENS_BACKUP.length - 1;
const MS_POR_IMAGEM_BACKUP = 1000;
const TEMPO_MENSAGEM_MS = 3500;
const CHAVE_MUNDOS_CONCLUIDOS = "repairsim_mundos_concluidos_v1";

function normalizarDificuldade(dificuldade) {
    const limpa = String(dificuldade || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (limpa === "medio") return "Medio";
    if (limpa === "dificil") return "Dificil";
    return "Facil";
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
        Facil: Boolean(atual?.Facil) || dif === "Facil",
        Medio: Boolean(atual?.Medio) || dif === "Medio",
        Dificil: Boolean(atual?.Dificil) || dif === "Dificil",
    };

    try {
        window.localStorage.setItem(CHAVE_MUNDOS_CONCLUIDOS, JSON.stringify(estado));
    } catch (erro) {
        console.warn("Não foi possível salvar progresso das dificuldades:", erro);
    }

    if (estado.Facil && estado.Medio && estado.Dificil) {
        ganharConquista("MESTRE_MUNDOS", "Mestre dos Três Mundos");
    }
}

function urlImagem(imagem) {
    if (!imagem?.caminho_imagem) {
        return "";
    }

    return `${API}${imagem.caminho_imagem}`;
}

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
    }
}

function CasoHd() {
    const navigate = useNavigate();
    const { jogatina, getDesafioAtual, adicionarPontos, registrarErroDesafio } = useJogo();

    const desafioAtual = getDesafioAtual();
    const idDesafio = desafioAtual?.id_desafio;

    const [imagensPc, setImagensPc] = useState([]);
    const [carregandoImagens, setCarregandoImagens] = useState(true);
    const [itens, setItens] = useState([]);

    const [tipoSelecionado, setTipoSelecionado] = useState(null);
    const [categoriaAberta, setCategoriaAberta] = useState(false);

    const [etapa, setEtapa] = useState(1);

    const [pcLigado, setPcLigado] = useState(true);
    const [gabineteAberto, setGabineteAberto] = useState(false);

    const [saudeVerificada, setSaudeVerificada] = useState(false);
    const [backupEmAndamento, setBackupEmAndamento] = useState(false);
    const [backupConcluido, setBackupConcluido] = useState(false);
    const [backupIndice, setBackupIndice] = useState(0);

    const [verificandoItem, setVerificandoItem] = useState(false);
    const [respostaFinalizada, setRespostaFinalizada] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [popup, setPopup] = useState(null);
    const [imagemAmpliada, setImagemAmpliada] = useState(null);

    const temporizadorMensagem = useRef(null);
    const inicioCasoRef = useRef(Date.now());
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
            setCarregandoImagens(false);
            return;
        }
        inicioCasoRef.current = Date.now();
        errosCasoRef.current = 0;

        let cancelado = false;
        setCarregandoImagens(true);

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
                console.error("Erro ao carregar imagens do Caso 8:", erro);
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
        if (!tipoSelecionado){
            return;
        }
        let cancelado = false;

        fetch(`${API}/itens/tipo/${tipoSelecionado}`)
            .then(resposta => {
                if (!resposta.ok) {
                    throw new Error("Erro ao buscar os itens.");
                }
                return resposta.json();
            })
            .then(dados => {
                if (!cancelado) {
                    setItens(Array.isArray(dados) ? dados : []);
                }
            })
            .catch(erro => {
                console.error("Erro ao carregar os itens:", erro);
                if (!cancelado) {
                    setItens([]);
                    mostrarMensagem("Não foi possível carregar os itens.");
                }
            });

        return () => {
            cancelado = true;
        };
    }, [tipoSelecionado, mostrarMensagem]);

    useEffect(() => {
        if (!backupEmAndamento) {
            return;
        }

        const temporizador = window.setTimeout(() => {
            if (backupIndice < ULTIMO_INDICE_BACKUP) {
                setBackupIndice(indice => indice + 1);
                return;
            }

            setBackupEmAndamento(false);
            setBackupConcluido(true);
            setEtapa(3);
            mostrarMensagem("");
            setPopup({
                titulo: "Backup concluído!",
                texto: "O backup foi finalizado com sucesso."
            });
        }, MS_POR_IMAGEM_BACKUP);

        return () => window.clearTimeout(temporizador);
    }, [backupEmAndamento, backupIndice, mostrarMensagem]);

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
    const gabineteLigado = buscarImagem("gabinete_ligado");
    const gabineteDesligado = buscarImagem("gabinete_desligado");

    const monitorErroHd = buscarImagem("monitor_erro_hd");
    const monitorSaudeHd = buscarImagem("monitor_saude_hd");
    const gabineteAbertoHd = buscarImagem("gabinete_aberto_hd");
    const gabineteBackup = buscarImagem("gabinete_backup");

    const imagensBackup = PORCENTAGENS_BACKUP.map(porcentagem =>
        buscarImagem(`monitor_backup_${porcentagem}%`, `monitor_backup_${porcentagem}`)
    );

    let imagemMonitorAtual;

    if (!pcLigado) {
        imagemMonitorAtual = monitorDesligado;
    }
    else if (backupEmAndamento) {
        imagemMonitorAtual = imagensBackup[backupIndice] ?? monitorLigado;
    }
    else if (backupConcluido) {
        imagemMonitorAtual = monitorLigado;
    }
    else if (saudeVerificada) {
        imagemMonitorAtual = monitorSaudeHd ?? monitorLigado;
    }
    else {
        imagemMonitorAtual = monitorErroHd ?? monitorLigado;
    }

    let imagemGabineteAtual;

    if (backupEmAndamento) {
        imagemGabineteAtual = gabineteBackup ?? gabineteLigado;
    }
    else if (gabineteAberto) {
        imagemGabineteAtual = gabineteAbertoHd ?? gabineteDesligado;
    }
    else if (pcLigado) {
        imagemGabineteAtual = gabineteLigado;
    }
    else {
        imagemGabineteAtual = gabineteDesligado;
    }

    function alternarEnergia() {
        if (backupEmAndamento) {
            mostrarMensagem("Aguarde o backup terminar antes de desligar o computador.");
            return;
        }

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
        if (backupEmAndamento || respostaFinalizada) {
            return;
        }

        if (pcLigado) {
            mostrarMensagem("Desligue o computador antes de abrir o gabinete.");
            return;
        }

        if (!gabineteAberto){
            setGabineteAberto(true);
            mostrarMensagem("Gabinete aberto.");
            return;
        }

        if (gabineteAbertoHd) {
            setImagemAmpliada({
                src: urlImagem(gabineteAbertoHd),
                alt: "Interior do gabinete para a troca do HD"
            });
        }
    }

    function fecharGabinete() {
        setGabineteAberto(false);
        mostrarMensagem("Gabinete fechado.");
    }

    function ampliarImagem(imagem, alt) {
        if (!imagem || backupEmAndamento) {
            return;
        }

        setImagemAmpliada({ src: urlImagem(imagem), alt });
    }

    function abrirCategoria(tipo) {
        if (backupEmAndamento || respostaFinalizada || verificandoItem) {
            return;
        }

        if (categoriaAberta && tipoSelecionado === tipo) {
            setCategoriaAberta(false);
        }
        else {
            abriuPainelRef.current = true;
            if (tipoSelecionado !== tipo){
                setItens([]);
            }
            setTipoSelecionado(tipo);
            setCategoriaAberta(true);
            ganharConquista("MAO_NA_MASSA", "Mão na Massa");
        }
    }

    async function usarItem(item) {
        if (verificandoItem || backupEmAndamento || respostaFinalizada) {
            return;
        }

        if (etapa === 1 || etapa === 2) {
            if (!pcLigado) {
                mostrarMensagem("Ligue o computador para executar esta ação.");
                return;
            }

            if (gabineteAberto) {
                mostrarMensagem("Feche o gabinete antes de utilizar o software.");
                return;
            }
        }

        if (etapa === 3) {
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

            if (etapa === 1) {
                setSaudeVerificada(true);
                setEtapa(2);
                mostrarMensagem("");
                setPopup({
                    titulo: "Saúde do HD verificada!",
                    texto: "A ferramenta identificou o estado do disco."
                });
                return;
            }

            if (etapa === 2) {
                setBackupIndice(0);
                setBackupEmAndamento(true);
                mostrarMensagem("Backup iniciado. Aguarde a conclusão.");
                return;
            }

            if (etapa === 3) {
                setEtapa(4);
                setRespostaFinalizada(true);
                const segundosGastos = Math.max(1, Math.round((Date.now() - inicioCasoRef.current) / 1000));
                registrarTempoBancada(desafioAtual?.dificuldade, segundosGastos);
                registrarDificuldadeConcluida(desafioAtual?.dificuldade);
                dispararConquistasConclusao(desafioAtual?.dificuldade, errosCasoRef.current);
                mostrarMensagem("Reparo concluído! Feche o gabinete para continuar.", true);
            }
        }
        catch (erro) {
            console.error("Erro ao executar ação do Caso 8:", erro);
            mostrarMensagem(erro.message || "Não foi possível verificar o item.");
        }
        finally {
            setVerificandoItem(false);
        }
    }

    if (!desafioAtual) {
        return (
            <div className={styles.screenWrapper}>
                <p>Não há desafio selecionado.</p>
            </div>
        );
    }

    const menuBloqueado = backupEmAndamento || respostaFinalizada || verificandoItem;

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
                    {imagemMonitorAtual ? (
                        <img
                            src={urlImagem(imagemMonitorAtual)}
                            alt="Monitor"
                            className={`${styles.monitorImage} ${hd.imagemZoomClicavel}`}
                            onClick={() => ampliarImagem(imagemMonitorAtual, "Monitor ampliado")}
                        />
                    ) : (
                        !carregandoImagens && (
                            <p className={hd.placeholderPcImage}>Imagem do monitor não cadastrada.</p>
                        )
                    )}

                    {imagemGabineteAtual ? (
                        <img
                            src={urlImagem(imagemGabineteAtual)}
                            alt="Gabinete do computador"
                            className={`${styles.gabineteImage} ${gabineteAberto ? hd.imagemZoomClicavel : hd.imagemAbrivel}`}
                            onClick={abrirOuAmpliarGabinete}
                        />
                    ) : (
                        !carregandoImagens && (
                            <p className={hd.placeholderPcImage}>Imagem do gabinete não cadastrada.</p>
                        )
                    )}
                </div>

                {!gabineteAberto && !backupEmAndamento && !respostaFinalizada && (
                    <button
                        type="button"
                        className={pcLigado ? styles.btnDesligar : hd.btnLigar}
                        onClick={alternarEnergia}
                    >
                        {pcLigado ? "DESLIGAR" : "LIGAR"}
                    </button>
                )}

                {gabineteAberto && !backupEmAndamento && (
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

                    {categoriaAberta && (
                        <div className={hd.toolsBoxSemRolagem}>
                            <h3 className={styles.titleTools}>
                                {tipoSelecionado === "ferramenta" && "Ferramentas"}
                                {tipoSelecionado === "peca" && "Peças"}
                                {tipoSelecionado === "software" && "Software"}
                            </h3>

                            <div className={styles.contentTools}>
                                {itens.length === 0 ? (
                                    <p>Carregando itens...</p>
                                ) : (
                                    itens.map(item => (
                                    <button type="button" key={item.id_item} className={hd.itemCard} disabled={menuBloqueado}
                                        title={item.nome} aria-label={item.nome} onClick={() => usarItem(item)}>
                                        <img src={urlImagem(item)} className={styles.imgItem} alt={item.nome} />
                                    </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {respostaFinalizada && !gabineteAberto && (
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
                            aria-labelledby="titulo-popup-hd"
                        >
                            <h2 id="titulo-popup-hd">{popup.titulo}</h2>
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

export default CasoHd;