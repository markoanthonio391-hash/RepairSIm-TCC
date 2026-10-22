import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./caso.module.css";        // estilos que o grupo já usa nos outros casos
import hd from "./casoHd.module.css";          // estilos exclusivos do Caso 8
import bancada from "../../assets/bancada.jpeg";
import { useJogo } from "../../context/JogoContext";
import VisualizadorImagem from "../../pages/caso/VisualizadorImagem";

// Endereço do servidor (o mesmo usado no restante do projeto).
const API = "http://localhost:3000";

// O backup mostra 5 imagens (0%, 25%, 50%, 75% e 100%), cada uma por 5 segundos.
const PORCENTAGENS_BACKUP = [0, 25, 50, 75, 100];
const ULTIMO_INDICE_BACKUP = PORCENTAGENS_BACKUP.length - 1;
const MS_POR_IMAGEM_BACKUP = 1000;
const TEMPO_MENSAGEM_MS = 3500;

// Monta a URL completa de uma imagem que veio do banco.
function urlImagem(imagem) {
    if (!imagem?.caminho_imagem) {
        return "";
    }

    return `${API}${imagem.caminho_imagem}`;
}

function CasoHd() {
    const navigate = useNavigate();
    const { jogatina, getDesafioAtual, adicionarPontos, registrarErroDesafio } = useJogo();

    const desafioAtual = getDesafioAtual();
    const idDesafio = desafioAtual?.id_desafio;

    // ----------------------- ESTADOS -----------------------

    // Dados vindos do backend
    const [imagensPc, setImagensPc] = useState([]);
    const [carregandoImagens, setCarregandoImagens] = useState(true);
    const [itens, setItens] = useState([]);

    // Menu de itens
    const [tipoSelecionado, setTipoSelecionado] = useState(null);
    const [categoriaAberta, setCategoriaAberta] = useState(false);

    // 1 = verificar saúde do HD | 2 = fazer backup | 3 = trocar o HD | 4 = concluído
    // O número da etapa é enviado ao backend como "ordem".
    const [etapa, setEtapa] = useState(1);

    // Estado do computador (energia e gabinete são independentes)
    const [pcLigado, setPcLigado] = useState(true);
    const [gabineteAberto, setGabineteAberto] = useState(false);

    // Progresso das ações
    const [saudeVerificada, setSaudeVerificada] = useState(false);
    const [backupEmAndamento, setBackupEmAndamento] = useState(false);
    const [backupConcluido, setBackupConcluido] = useState(false);
    const [backupIndice, setBackupIndice] = useState(0);

    // Controles da interface
    const [verificandoItem, setVerificandoItem] = useState(false);
    const [respostaFinalizada, setRespostaFinalizada] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [popup, setPopup] = useState(null);
    const [imagemAmpliada, setImagemAmpliada] = useState(null);

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

    // Imagens do computador neste desafio
    useEffect(() => {
        if (!idDesafio) {
            setCarregandoImagens(false);
            return;
        }

        let cancelado = false; // evita atualizar o estado se a tela já foi fechada
        setCarregandoImagens(true);

        fetch(`${API}/desafio-imagens-pc/desafio/${idDesafio}`)
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

    // Itens da categoria aberta (ferramenta, peça ou software)
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

    // ----------------------- ANIMAÇÃO DO BACKUP -----------------------

    // A cada 5 segundos avança uma imagem (0% -> 25% -> ... -> 100%).
    // Quando a imagem de 100% já ficou 5 segundos, o backup termina.
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

        // Cancela o temporizador se a tela for fechada no meio do backup.
        return () => window.clearTimeout(temporizador);
    }, [backupEmAndamento, backupIndice, mostrarMensagem]);

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
    const gabineteLigado = buscarImagem("gabinete_ligado");
    const gabineteDesligado = buscarImagem("gabinete_desligado");

    // Imagens próprias do Caso 8
    const monitorErroHd = buscarImagem("monitor_erro_hd");
    const monitorSaudeHd = buscarImagem("monitor_saude_hd");
    const gabineteAbertoHd = buscarImagem("gabinete_aberto_hd");
    const gabineteBackup = buscarImagem("gabinete_backup");

    // No banco os nomes são "monitor_backup_0%", "monitor_backup_25%"...
    // (o nome sem o "%" também é aceito, caso o grupo padronize depois).
    const imagensBackup = PORCENTAGENS_BACKUP.map(porcentagem =>
        buscarImagem(`monitor_backup_${porcentagem}%`, `monitor_backup_${porcentagem}`)
    );

    // Qual imagem do MONITOR aparece agora?
    // O "??" garante uma imagem reserva se alguma do caso não estiver cadastrada.
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

    // Qual imagem do GABINETE aparece agora?
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

    // ----------------------- AÇÕES DO JOGADOR -----------------------

    // Botão LIGAR / DESLIGAR
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

    // Clicar no gabinete: só abre com o PC desligado
    function abrirOuAmpliarGabinete() {
        if (backupEmAndamento || respostaFinalizada) {
            return;
        }

        if (pcLigado) {
            mostrarMensagem("Desligue o computador antes de abrir o gabinete.");
            return;
        }

        // Continua aberto mesmo depois de fechar o zoom.
        setGabineteAberto(true);
        mostrarMensagem("Gabinete aberto.");

        //não da zoom quando abre o gabinete
        if (!gabineteAberto){
            setGabineteAberto(true);
            mostrarMensagem("Gabinete aberto.");
            return;
        }

        //agora da o zoom se clicado na segunda vez
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

    // Clicar no monitor: abre a imagem ampliada
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
            if (tipoSelecionado !== tipo){ 
                setItens([]); }
            setTipoSelecionado(tipo);
            setCategoriaAberta(true);
        }
    }

    // Clicar em um item: confere se o computador está no estado certo
    // e depois pergunta ao backend se o item está certo PARA ESTA ETAPA.
    async function usarItem(item) {
        if (verificandoItem || backupEmAndamento || respostaFinalizada) {
            return;
        }

        // Etapas 1 e 2 (software): PC ligado e gabinete fechado
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

        // Etapa 3 (troca do HD): PC desligado e gabinete aberto
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

        setVerificandoItem(true);
        mostrarMensagem("Verificando item...", true); //true permite não sumir sozinha

        try {
            const resposta = await fetch(`${API}/desafios/${idDesafio}/verificar`, {
                method: "POST",
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

            // Etapa 1: saúde do HD
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

            // Etapa 2: backup (a etapa 3 só abre quando a animação terminar)
            if (etapa === 2) {
                setBackupIndice(0);
                setBackupEmAndamento(true);
                mostrarMensagem("Backup iniciado. Aguarde a conclusão.");
                return;
            }

            // Etapa 3: troca do HD (fim do desafio)
            if (etapa === 3) {
                setEtapa(4);
                setRespostaFinalizada(true);
                setGabineteAberto(false);
                setPcLigado(false);
                mostrarMensagem("Reparo concluído com sucesso.");
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

    // ----------------------- TELA -----------------------

    // Todos os hooks ficam ACIMA deste return (regra dos hooks do React).
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

                {/* Ligar / desligar (some com o gabinete aberto, durante o backup e no fim) */}
                {!gabineteAberto && !backupEmAndamento && !respostaFinalizada && (
                    <button
                        type="button"
                        className={pcLigado ? styles.btnDesligar : hd.btnLigar}
                        onClick={alternarEnergia}
                    >
                        {pcLigado ? "DESLIGAR" : "LIGAR"}
                    </button>
                )}

                {gabineteAberto && !backupEmAndamento && !respostaFinalizada && (
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

                {/* O relatório só é liberado depois das 3 ações */}
                {respostaFinalizada && (
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

                {/* Pop-ups das etapas */}
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