import { useState, useRef, useEffect } from "react";
import styles from "./cliente.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useJogo } from "../../context/JogoContext";

const BALAO_INICIO = 2;
const BALAO_FIM = 9;

// O vídeo NÃO repete: ele para (congela) nos últimos milissegundos e o cliente fica parado no balcão.
// A música dos casos (musica_casos) agora toca no MusicaGlobal, durante todos os casos, e continua com o vídeo congelado.
const CONGELAR_NO_SEGUNDO = 8.9;     // null = congela no ÚLTIMO quadro. Ex.: 8.8 congela com o balão ainda na tela.
const MARGEM_ULTIMO_QUADRO = 0.04;    // segundos antes do fim (últimos milissegundos)

function Cliente() {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarTexto, setMostrarTexto] = useState(false);

  const videoRef = useRef(null);
  const textoVisivelRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let congelou = false;
    let frame;

    const verificar = () => {
      const t = video.currentTime;

      const deveMostrar = t >= BALAO_INICIO && t <= BALAO_FIM;

      if (deveMostrar !== textoVisivelRef.current) {
        textoVisivelRef.current = deveMostrar;
        setMostrarTexto(deveMostrar);
      }

      // congela o vídeo no ponto escolhido (o quadro fica na tela e o vídeo não recomeça)
      if (!congelou && Number.isFinite(video.duration)) {
        const pontoDeParada = CONGELAR_NO_SEGUNDO ?? (video.duration - MARGEM_ULTIMO_QUADRO);

        if (t >= pontoDeParada) {
          congelou = true;
          video.pause();
        }
      }

      frame = requestAnimationFrame(verificar);
    };

    frame = requestAnimationFrame(verificar);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const [aviso, setAviso] = useState(null);
  const [statusOrcamento, setStatusOrcamento] = useState("Em Andamento");

  const { getDesafioAtual, aceitarDesafio, finalizarJogatina, jogatina } = useJogo();

  const desafioAtual = getDesafioAtual();

  const responderOrcamento = (novoStatus) => {
    setStatusOrcamento(novoStatus);

    setAviso({
      texto: `Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`,
      tipo: novoStatus === "Aprovado" ? "sucesso" : "erro"
    });

    setTimeout(() => setAviso(null), 2500);
  };

  if (!desafioAtual) {
    return <Navigate to="/dificuldade" replace />;
  }

  async function recusarDesafio() {

    try {

      if (jogatina.indiceAtual === 0) {
        navigate("/dificuldade");
        return;
      }

      await finalizarJogatina(0, jogatina.indiceAtual);

      navigate("/resultado");

    } catch (erro) {
      console.error("Erro ao finalizar jogatina:", erro);
    }
  }

  return (
    <div className={styles.container}>

      <div className={styles.balcao}>

        <div className={styles.cabecalho}>
          <h2>Área do Cliente</h2>
          <p>Bem-vindo cliente {desafioAtual.cliente}!</p>
        </div>

        <div className={styles.palco}>
          <video
            className={styles.video}
            src="/videos/problema_cliente.mp4"
            autoPlay
            muted
            playsInline
            ref={videoRef}
          />

          {mostrarTexto && (
            <div className={styles.textoBalao}>
              {desafioAtual.descricao}
            </div>
          )}
        </div>

        <div className={styles.falaMobile}>
          {desafioAtual.descricao}
        </div>

        <button
          className={`${styles.btnPrincipal} ${styles.btnBalcao}`}
          onClick={() => setIsModalOpen(true)}
        >
          Sistema de Manutenção
        </button>

      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalConteudo}
            onClick={(e) => e.stopPropagation()}
          >

            <div className={styles.modalHeader}>
              <h3>Ordem de Serviço {desafioAtual.id_desafio}</h3>

              <span
                className={`${styles.status} ${
                  statusOrcamento === "Em Andamento"
                    ? styles.emAndamento
                    : statusOrcamento === "Aprovado"
                    ? styles.aprovado
                    : styles.reprovado
                }`}
              >
                {statusOrcamento}
              </span>
            </div>

            <div className={styles.modalCorpo}>

              <div className={styles.secaoInfo}>
                <h4>{desafioAtual.titulo}</h4>
                <p>
                  <strong>Sintomas:</strong> {desafioAtual.descricao}
                </p>
              </div>

              <div className={styles.acoes}>

                <button
                  className={styles.btnCancelar}
                  onClick={async () => {
                    responderOrcamento("Reprovado");
                    await recusarDesafio();
                  }}
                >
                  Cancelar Orçamento
                </button>

                <button
                  className={styles.btnAceitar}
                  onClick={() => {
                    responderOrcamento("Aprovado");
                    aceitarDesafio();
                    navigate("/caso");
                  }}
                >
                  Aceitar Desafio
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div
          className={`${styles.avisoFlutuante} ${
            aviso.tipo === "sucesso"
              ? styles.avisoSucesso
              : styles.avisoErro
          }`}
        >
          {aviso.texto}
        </div>
      )}

    </div>
  );
}

export default Cliente;