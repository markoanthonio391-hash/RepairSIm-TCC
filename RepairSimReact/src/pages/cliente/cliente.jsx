import { useState, useRef, useEffect } from "react";
import styles from "./cliente.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useJogo } from "../../context/JogoContext";

const BALAO_INICIO = 2;
const BALAO_FIM = 9;

const AUDIO_INICIO = BALAO_INICIO;
const AUDIO_SRC = "/audios/audio1.mpeg";
const AUDIO_EM_LOOP = false;
const AUDIO_VOLUME = 1;

function Cliente() {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarTexto, setMostrarTexto] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const textoVisivelRef = useRef(false);
  const audioTocouRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (audio) {
      audio.volume = AUDIO_VOLUME;

      if (AUDIO_EM_LOOP) audio.play().catch(() => {});
    }

    let frame;

    const verificar = () => {
      const t = video.currentTime;

      const deveMostrar = t >= BALAO_INICIO && t <= BALAO_FIM;

      if (deveMostrar !== textoVisivelRef.current) {
        textoVisivelRef.current = deveMostrar;
        setMostrarTexto(deveMostrar);
      }

      if (audio && !AUDIO_EM_LOOP) {
        if (t < AUDIO_INICIO) {
          audioTocouRef.current = false;
        } else if (!audioTocouRef.current) {
          audioTocouRef.current = true;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }

      frame = requestAnimationFrame(verificar);
    };

    frame = requestAnimationFrame(verificar);

    return () => {
      cancelAnimationFrame(frame);
      audio?.pause();
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

      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop={AUDIO_EM_LOOP}
        preload="auto"
      />

      <div className={styles.balcao}>

        <div className={styles.cabecalho}>
          <h2>Área do Cliente</h2>
          <p>Bem-vindo cliente {desafioAtual.cliente}!</p>
        </div>

        <div className={styles.palco}>
          <video
            className={styles.video}
            src="/videos/video1.mp4"
            autoPlay
            muted
            loop
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
          onClick={() => {
            if (AUDIO_EM_LOOP) audioRef.current?.play().catch(() => {});
            setIsModalOpen(true);
          }}
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