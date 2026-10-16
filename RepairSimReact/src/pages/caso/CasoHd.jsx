import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./caso.module.css";
import bancada from "../../assents/bancada.jpeg";
import { useJogo } from "../../context/JogoContext";
import VisualizadorImagem from "../../components/VisualizadorImagem";
//endereço do servidor do projeto.
const API = "http://localhost:3000";

//converte uma imagem recebida do banco em uma url acessivel.
function urlImagem(imagem){
    if (!imagem?.caminho_imagem){
        return "";
    }

    return `${API}${imagem.caminho_imagem}`;
}

function CasoHd(){
    const navigate = useNavigate();

    const{jogatina, getDesafioAtual, adicionarPontos, registrarErroDesafio} = useJogo();

    const desafioAtual = getDesafioAtual();

    const idDesafio = desafioAtual?.id_desafio;

    //estado do cenario
    const [imagensPc, setImagensPc] = useStates([]);
    const [itens, setItens] = useState([]);
    const [tipoSelecionado, setTipoSelecionado] = useState("software");
    const [categoriaAberta, setCategoriaAberta] = useStates(true);

    //etapas: verificar saude HD, realizar backup e trocar o HD
    const [etapa, setEtapa] = useState(1);

    //energia do computador.
    const [pcLigado, setPcLigado] = useState(true);

     //indica se o gabinete está aberto.
    const [gabineteAberto, setGabineteAberto] = useState(false);

    //progresso das ações.
    const [saudeVerificada, setSaudeVerificada] = useState(false);
    const [backupEmAndamento, setBackupEmAndamento] = useState(false);
    const [backupConcluido, setBackupConcluido] = useState(false);
    const [backupIndice, setBackupIndice] = useState(0);

    //COntroles da interface.
    const [verificandoItem, setVerificandoItem] = useState(false);
    const [respostaFinalizada, setRespostaFinalizada] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [popup, setPopup] = useState(null);
    const [imagemApliada, setImagemAmpliada] = useState(null);

    //buscar imagens do caso 8 
    useEffect(() => {
        if (!idDesafio) {
            setCarregandoImagens(false);
            return;
        }

        let cancelado = false;
        setCarregandoImagens(true);

        fetch(`${API}/desafio-imagens-pc/desafio/${idDesafio}`)
        .then(resposta => {
            if(!resposta.ok){
                throw new Error(
                    "Erro ao buscar as imagens do caso 8."
                );
            }

            return resposta.json();

        })
        .then(dados => {
            if(!cancelado) {
                setImagensPc(
                    Array.isArray(dados) ? dados : []
                );
            }
        })
        .catch(erro => {
            console.error(
                "Erro ao carregar imagens do Caso 8:", erro
            );
            if(!cancelado) {
                setMensagem(
                    "Não foi possivel carregar as imagens do computador."
                );
            }
        })
        .finally(() => {
            if (!cancelado) {
                setCarregandoImagens(false);
            }
        });
        //evitando atualizar o componente se ele for desmontado.
        return() => {
            cancelado = true;
        };
    }, [idDesafio]);

    //buscar itens da categoria selecionada
    useEffect(() => {
        let cancelado = false;

        fetch(`${API}/itens/tipo/${tipoSelecionado}`)

        .then(respota => {
            if (!respota.ok) {
                throw new Error("Erro ao buscar os itens.");
            }
            return respota.json();
        })
        .then(dados => {
            if (!cancelado){
                setItens(
                    Array.isArray(dados) ? dados : []
                );
            }
        })
        .catch(erro => {
            console.error(
                "Erro ao carregar os itens:", erro
            );

            if(!cancelado){
                setItens([]);
                setMensagem("Não foi possível carregar os itens.");
            }
        });
        return() => {cancelado = true;};
    }, [tipoSelecionado]);
    
    //NOTA: ANALISAR O QUE VEM LOGO ABAIXO, EU COPIEI DO CHAT ENT É BOM DA UMA ANALISADA E ENTENDER O QUE ELE FEZ ALÉM DE DEIXAR A MIHA CARA

    useEffect(() => {

        // Não há animação se o backup não foi iniciado.
        if (!backupEmAndamento) {
            return;
        }


        /*
         * Cada imagem permanece na tela por 5 segundos.
         *
         * Índice 0: 0%
         * Índice 1: 25%
         * Índice 2: 50%
         * Índice 3: 75%
         * Índice 4: 100%
         *
         * Quando o índice já é 4, aguardamos os últimos
         * 5 segundos antes de encerrar a animação.
         */

        const temporizador = window.setTimeout(() => {

            if (backupIndice < 4) {

                setBackupIndice(
                    indiceAtual => indiceAtual + 1
                );

                return;
            }


            // A imagem de 100% já permaneceu 5 segundos.
            // Agora o backup pode ser considerado concluído.

            setBackupEmAndamento(false);

            setBackupConcluido(true);

            setEtapa(3);


            // Na terceira etapa, a categoria Peças
            // é aberta automaticamente.

            setTipoSelecionado("peca");

            setCategoriaAberta(true);

            setMensagem("");


            setPopup({

                titulo: "Backup concluído!",

                texto:
                    "O backup foi finalizado com sucesso. Agora desligue o computador, abra o gabinete e faça a troca do HD."

            });

        }, 5000);


        // Limpa o temporizador se o componente sair da tela.
        return () => {
            window.clearTimeout(temporizador);
        };

    }, [
        backupEmAndamento,
        backupIndice
    ]);


    // ========================================================
    // LOCALIZAR UMA IMAGEM PELA FUNÇÃO CADASTRADA NO BANCO
    // ========================================================

    function buscarImagem(...funcoes) {

        return imagensPc.find(imagem =>
            funcoes.includes(imagem.funcao)
        );

    }


    // Imagens gerais: já utilizadas em outros desafios.

    const monitorLigado =
        buscarImagem("monitor_ligado");

    const monitorDesligado =
        buscarImagem("monitor_desligado");

    const gabineteLigado =
        buscarImagem("gabinete_ligado");

    const gabineteDesligado =
        buscarImagem("gabinete_desligado");


    // Imagens próprias do Caso 8.
    // Os nomes alternativos mantêm compatibilidade
    // com as funções antigas do banco.

    const monitorErroHd =
        buscarImagem(
            "monitor_erro_hd",
            "gabinete_erro_hd"
        );

    const monitorSaudeHd =
        buscarImagem(
            "monitor_saude_hd",
            "monitor_informacao_hd"
        );


    const gabineteAbertoHd =
        buscarImagem(
            "gabinete_aberto_hd",
            "gabinete_limpo",
            "gabinete_empoeirado"
        );


    const gabineteBackup =
        buscarImagem(
            "gabinete_backup"
        );


    // Cinco imagens usadas durante a animação.

    const imagensBackup = [

        buscarImagem(
            "monitor_backup_0",
            "monitor_backup_0%"
        ),

        buscarImagem(
            "monitor_backup_25",
            "monitor_backup_25%"
        ),

        buscarImagem(
            "monitor_backup_50",
            "monitor_backup_50%"
        ),

        buscarImagem(
            "monitor_backup_75",
            "monitor_backup_75%"
        ),

        buscarImagem(
            "monitor_backup_100",
            "monitor_backup_100%"
        )

    ];


    const porcentagensBackup = [
        0,
        25,
        50,
        75,
        100
    ];


    // ========================================================
    // DEFINIR A IMAGEM ATUAL DO MONITOR
    // ========================================================

    let imagemMonitorAtual = null;


    if (!pcLigado) {

        // Um monitor desligado sempre exibe a tela apagada.
        imagemMonitorAtual = monitorDesligado;

    }

    else if (backupEmAndamento) {

        // Durante o backup, mostrar a imagem da porcentagem.
        imagemMonitorAtual =
            imagensBackup[backupIndice];

    }

    else if (backupConcluido) {

        // Após o backup, voltar ao monitor normal.
        imagemMonitorAtual = monitorLigado;

    }

    else if (saudeVerificada) {

        // Saúde verificada, mas backup ainda não concluído.
        imagemMonitorAtual = monitorSaudeHd;

    }

    else {

        // Estado inicial do Caso 8.
        imagemMonitorAtual = monitorErroHd;

    }


    // ========================================================
    // DEFINIR A IMAGEM ATUAL DO GABINETE
    // ========================================================

    let imagemGabineteAtual = null;


    if (backupEmAndamento) {

        // Gabinete com o HD externo durante o backup.
        imagemGabineteAtual = gabineteBackup;

    }

    else if (gabineteAberto) {

        // Vista interna para a etapa de troca do HD.
        imagemGabineteAtual = gabineteAbertoHd;

    }

    else if (pcLigado) {

        imagemGabineteAtual = gabineteLigado;

    }

    else {

        imagemGabineteAtual = gabineteDesligado;

    }


    // ========================================================
    // TEXTO DA ETAPA ATUAL
    // ========================================================

    let textoEtapa = "";


    if (etapa === 1) {

        textoEtapa =
            "Etapa 1 de 3 — Verificar a saúde do HD";

    }

    else if (etapa === 2 && backupEmAndamento) {

        textoEtapa =
            "Etapa 2 de 3 — Backup em andamento";

    }

    else if (etapa === 2) {

        textoEtapa =
            "Etapa 2 de 3 — Fazer backup dos arquivos";

    }

    else if (etapa === 3) {

        textoEtapa =
            "Etapa 3 de 3 — Trocar o HD";

    }

    else {

        textoEtapa =
            "Desafio concluído";

    }


    // ========================================================
    // LIGAR E DESLIGAR O COMPUTADOR
    // ========================================================

    function alternarEnergia() {

        if (backupEmAndamento) {

            setMensagem(
                "Aguarde o backup terminar antes de desligar o computador."
            );

            return;

        }


        if (respostaFinalizada) {
            return;
        }


        if (gabineteAberto) {

            setMensagem(
                "Feche o gabinete antes de ligar o computador."
            );

            return;

        }


        if (pcLigado) {

            setPcLigado(false);

            setMensagem(
                "Computador desligado."
            );

        }

        else {

            setPcLigado(true);

            setMensagem(
                "Computador ligado."
            );

        }

    }


    // ========================================================
    // ABRIR OU AMPLIAR O GABINETE
    // ========================================================

    function abrirOuAmpliarGabinete() {

        if (backupEmAndamento || respostaFinalizada) {
            return;
        }


        if (pcLigado) {

            setMensagem(
                "Desligue o computador antes de abrir o gabinete."
            );

            return;

        }


        // Marca o gabinete como aberto.
        // Essa condição permanece mesmo após fechar o zoom.

        setGabineteAberto(true);

        setMensagem("Gabinete aberto.");


        // Abre a imagem interna ampliada.
        if (gabineteAbertoHd) {

            setImagemAmpliada({

                src: urlImagem(gabineteAbertoHd),

                alt: "Interior do gabinete para a troca do HD"

            });

        }

    }


    // ========================================================
    // FECHAR O GABINETE
    // ========================================================

    function fecharGabinete() {

        setGabineteAberto(false);

        setMensagem(
            "Gabinete fechado. Você pode ligar o computador novamente."
        );

    }


    // ========================================================
    // ABRIR UMA IMAGEM AMPLIADA
    // ========================================================

    function ampliarImagem(imagem, alt) {

        if (!imagem || backupEmAndamento) {
            return;
        }


        setImagemAmpliada({

            src: urlImagem(imagem),

            alt

        });

    }


    // ========================================================
    // ABRIR / FECHAR CATEGORIAS
    // ========================================================

    function abrirCategoria(tipo) {

        if (
            backupEmAndamento ||
            respostaFinalizada ||
            verificandoItem
        ) {
            return;
        }


        if (
            categoriaAberta &&
            tipoSelecionado === tipo
        ) {

            setCategoriaAberta(false);

        }

        else {

            setTipoSelecionado(tipo);

            setCategoriaAberta(true);

        }

    }


    // ========================================================
    // USAR UM ITEM PARA EXECUTAR A ETAPA ATUAL
    // ========================================================

    async function usarItem(item) {

        // Não aceita cliques durante verificações,
        // animação ou depois do término do desafio.

        if (
            verificandoItem ||
            backupEmAndamento ||
            respostaFinalizada ||
            etapa === 4
        ) {
            return;
        }


        // ----------------------------------------------------
        // ETAPAS 1 E 2: PC LIGADO, GABINETE FECHADO
        // ----------------------------------------------------

        if (etapa === 1 || etapa === 2) {

            if (!pcLigado) {

                setMensagem(
                    "Ligue o computador para executar esta ação."
                );

                return;

            }


            if (gabineteAberto) {

                setMensagem(
                    "Feche o gabinete antes de utilizar o software."
                );

                return;

            }

        }


        // ----------------------------------------------------
        // ETAPA 3: PC DESLIGADO, GABINETE ABERTO
        // ----------------------------------------------------

        if (etapa === 3) {

            if (pcLigado) {

                setMensagem(
                    "Desligue o computador antes de trocar o HD."
                );

                return;

            }


            if (!gabineteAberto) {

                setMensagem(
                    "Desligue o PC e abra o gabinete antes de trocar o HD."
                );

                return;

            }

        }


        setVerificandoItem(true);

        setMensagem("Verificando item...");


        try {

            // -----------------------------------------------
            // CONSULTA AO BACKEND
            // -----------------------------------------------

            const resposta = await fetch(
                `${API}/desafios/${idDesafio}/verificar`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        id_item: item.id_item,

                        // O backend consulta a relação
                        // entre item, desafio e ordem.

                        ordem: etapa

                    })

                }
            );


            const resultado = await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    resultado.mensagem ||
                    "Erro ao verificar o item."
                );

            }


            console.log(
                "Resultado da verificação do Caso 8:",
                resultado
            );


            // -----------------------------------------------
            // APLICAR A PONTUAÇÃO
            // -----------------------------------------------

            adicionarPontos(
                Number(resultado.pontos || 0)
            );


            // -----------------------------------------------
            // ITEM INCORRETO
            // -----------------------------------------------

            if (!resultado.correto) {

                registrarErroDesafio();

                setMensagem(
                    "❌ " + resultado.mensagem
                );

                // Não altera a etapa.
                // O jogador poderá tentar novamente.

                return;

            }


            // -----------------------------------------------
            // ETAPA 1 — SAÚDE DO HD
            // -----------------------------------------------

            if (etapa === 1) {

                setSaudeVerificada(true);

                setEtapa(2);

                setMensagem("");


                setPopup({

                    titulo: "Saúde do HD verificada!",

                    texto:
                        "A ferramenta identificou o estado do disco. Agora faça o backup antes de substituir o HD."

                });

                return;

            }


            // -----------------------------------------------
            // ETAPA 2 — BACKUP
            // -----------------------------------------------

            if (etapa === 2) {

                /*
                 * Não libera a etapa 3 imediatamente.
                 * Primeiro executa toda a animação.
                 */

                setBackupIndice(0);

                setBackupEmAndamento(true);

                setMensagem(
                    "Backup iniciado. Aguarde a conclusão."
                );

                return;

            }


            // -----------------------------------------------
            // ETAPA 3 — TROCA DO HD
            // -----------------------------------------------

            if (etapa === 3) {

                setEtapa(4);

                setRespostaFinalizada(true);

                setGabineteAberto(false);

                setPcLigado(false);

                setMensagem(
                    "✅ HD substituído com sucesso. As três ações foram concluídas."
                );

                return;

            }

        }

        catch (erro) {

            console.error(
                "Erro ao executar ação do Caso 8:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível verificar o item."
            );

        }

        finally {

            setVerificandoItem(false);

        }

    }


    // ========================================================
    // TRATAMENTO DE CARREGAMENTO / DESAFIO INEXISTENTE
    // ========================================================

    if (!desafioAtual) {

        return (
            <div className={styles.screenWrapper}>
                <p>Não há desafio selecionado.</p>
            </div>
        );

    }


    if (Number(idDesafio) !== 8) {

        return (
            <div className={styles.screenWrapper}>
                <p>Este componente é exclusivo do Caso 8.</p>
            </div>
        );

    }


    // ========================================================
    // INTERFACE
    // ========================================================

    return (

        <div className={styles.screenWrapper}>

            <div className={styles.mainContainer}>


                {/* -------------------------------------------
                    STATUS DA JOGATINA
                ------------------------------------------- */}

                <div className={styles.statusJogo}>

                    <span>
                        Caso {jogatina.indiceAtual + 1}
                        {" / "}
                        {jogatina.quantidadeCasos}
                    </span>

                    <span>
                        Pontos: {jogatina.pontos}
                    </span>

                </div>


                <img
                    src={bancada}
                    alt="Bancada de manutenção"
                    className={styles.bancada}
                />


                <button
                    type="button"
                    className={styles.btnVoltar}
                    onClick={() => navigate("/")}
                >
                    VOLTAR
                </button>


                {/* -------------------------------------------
                    PAINEL DE ETAPAS
                ------------------------------------------- */}

                <div className={styles.painelEtapasHd}>

                    <h3>Caso 8 — HD danificado</h3>

                    <p>{textoEtapa}</p>

                    {!pcLigado && (
                        <p>
                            Computador desligado
                        </p>
                    )}

                    {gabineteAberto && (
                        <p>
                            Gabinete aberto
                        </p>
                    )}

                    {backupEmAndamento && (
                        <p>
                            Backup:{" "}
                            {porcentagensBackup[backupIndice]}%
                        </p>
                    )}

                </div>


                {/* -------------------------------------------
                    COMPUTADOR NA BANCADA
                ------------------------------------------- */}

                <div className={styles.pcContainer}>


                    {/* MONITOR */}

                    {imagemMonitorAtual ? (

                        <img
                            src={urlImagem(imagemMonitorAtual)}
                            alt="Monitor do Caso 8"
                            className={`${styles.monitorImage} ${styles.imagemZoomClicavel}`}
                            onClick={() => {

                                ampliarImagem(
                                    imagemMonitorAtual,
                                    "Monitor do Caso 8 ampliado"
                                );

                            }}
                        />

                    ) : (

                        !carregandoImagens && (

                            <p className={styles.placeholderPcImage}>
                                Imagem do monitor não cadastrada.
                            </p>

                        )

                    )}


                    {/* GABINETE */}

                    {imagemGabineteAtual ? (

                        <img
                            src={urlImagem(imagemGabineteAtual)}
                            alt={
                                gabineteAberto
                                    ? "Gabinete aberto"
                                    : backupEmAndamento
                                        ? "Gabinete realizando backup"
                                        : "Gabinete do computador"
                            }
                            className={`${styles.gabineteImage} ${styles.imagemZoomClicavel}`}
                            onClick={abrirOuAmpliarGabinete}
                        />

                    ) : (

                        !carregandoImagens && (

                            <p className={styles.placeholderPcImage}>
                                Imagem do gabinete não cadastrada.
                            </p>

                        )

                    )}

                </div>


                {/* -------------------------------------------
                    LIGAR / DESLIGAR
                ------------------------------------------- */}

                {!gabineteAberto &&
                    !backupEmAndamento &&
                    !respostaFinalizada && (

                        <button
                            type="button"
                            className={
                                pcLigado
                                    ? styles.btnDesligar
                                    : styles.btnLigar
                            }
                            onClick={alternarEnergia}
                        >
                            {pcLigado ? "DESLIGAR" : "LIGAR"}
                        </button>

                    )}


                {/* -------------------------------------------
                    FECHAR GABINETE
                ------------------------------------------- */}

                {gabineteAberto &&
                    !backupEmAndamento &&
                    !respostaFinalizada && (

                        <button
                            type="button"
                            className={styles.btnFecharGabinete}
                            onClick={fecharGabinete}
                        >
                            FECHAR GABINETE
                        </button>

                    )}


                {/* -------------------------------------------
                    MENSAGEM DURANTE A AÇÃO
                ------------------------------------------- */}

                {mensagem && (

                    <div className={styles.mensagem}>

                        {mensagem}

                    </div>

                )}


                {/* -------------------------------------------
                    CATEGORIAS DE ITENS
                ------------------------------------------- */}

                <div className={styles.toolsContainer}>


                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorTool} ${
                            categoriaAberta &&
                            tipoSelecionado === "ferramenta"
                                ? styles.active
                                : ""
                        }`}
                        disabled={
                            backupEmAndamento ||
                            respostaFinalizada ||
                            verificandoItem
                        }
                        onClick={() =>
                            abrirCategoria("ferramenta")
                        }
                    >
                        FERRAMENTAS
                    </button>


                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorComp} ${
                            categoriaAberta &&
                            tipoSelecionado === "peca"
                                ? styles.active
                                : ""
                        }`}
                        disabled={
                            backupEmAndamento ||
                            respostaFinalizada ||
                            verificandoItem
                        }
                        onClick={() =>
                            abrirCategoria("peca")
                        }
                    >
                        PEÇAS
                    </button>


                    <button
                        type="button"
                        className={`${styles.btnToolsBox} ${styles.btnColorSoft} ${
                            categoriaAberta &&
                            tipoSelecionado === "software"
                                ? styles.active
                                : ""
                        }`}
                        disabled={
                            backupEmAndamento ||
                            respostaFinalizada ||
                            verificandoItem
                        }
                        onClick={() =>
                            abrirCategoria("software")
                        }
                    >
                        SOFTWARE
                    </button>


                    {/* ---------------------------------------
                        ITENS DA CATEGORIA
                    --------------------------------------- */}

                    {categoriaAberta && (

                        <div className={styles.toolsBox}>

                            <h3 className={styles.titleTools}>

                                {tipoSelecionado === "ferramenta" &&
                                    "Ferramentas"}

                                {tipoSelecionado === "peca" &&
                                    "Peças"}

                                {tipoSelecionado === "software" &&
                                    "Software"}

                            </h3>


                            <div className={styles.contentTools}>

                                {itens.length === 0 ? (

                                    <p>
                                        Nenhum item disponível nesta categoria.
                                    </p>

                                ) : (

                                    itens.map(item => (

                                        <button
                                            type="button"
                                            key={item.id_item}
                                            className={styles.itemCard}
                                            disabled={
                                                backupEmAndamento ||
                                                respostaFinalizada ||
                                                verificandoItem
                                            }
                                            onClick={() =>
                                                usarItem(item)
                                            }
                                        >

                                            <img
                                                src={
                                                    `${API}${item.caminho_imagem}`
                                                }
                                                className={styles.imgItem}
                                                alt={item.nome}
                                            />

                                            <span>
                                                {item.nome}
                                            </span>

                                        </button>

                                    ))

                                )}

                            </div>

                        </div>

                    )}

                </div>


                {/* -------------------------------------------
                    LIBERAR RELATÓRIO SOMENTE APÓS AS 3 AÇÕES
                ------------------------------------------- */}

                {respostaFinalizada && (

                    <button
                        type="button"
                        className={styles.btnRelatorio}
                        onClick={() =>
                            navigate(`/relatorio/${idDesafio}`)
                        }
                    >
                        IR PARA RELATÓRIO
                    </button>

                )}


                {/* -------------------------------------------
                    MODAL DA IMAGEM AMPLIADA
                ------------------------------------------- */}

                {imagemAmpliada && (

                    <VisualizadorImagem
                        src={imagemAmpliada.src}
                        alt={imagemAmpliada.alt}
                        closeLabel="VOLTAR AO COMPUTADOR"
                        onClose={() =>
                            setImagemAmpliada(null)
                        }
                    />

                )}


                {/* -------------------------------------------
                    POP-UPS DAS ETAPAS
                ------------------------------------------- */}

                {popup && (

                    <div
                        className={styles.overlayPopup}
                        role="presentation"
                    >

                        <section
                            className={styles.popupCard}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="titulo-popup-hd"
                        >

                            <h2 id="titulo-popup-hd">
                                {popup.titulo}
                            </h2>

                            <p>
                                {popup.texto}
                            </p>

                            <button
                                type="button"
                                className={styles.botaoPopup}
                                onClick={() =>
                                    setPopup(null)
                                }
                            >
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