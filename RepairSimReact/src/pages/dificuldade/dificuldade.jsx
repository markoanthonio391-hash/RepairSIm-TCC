import { useState, useEffect } from 'react'
import styles from './Dificuldade.module.css'
import TechSolveLogo from '../../components/TechSolveLogo'
import logoFacil from '../../assets/logoFacil.png'
import logoNormal from '../../assets/logoNormal.png'
import logoDificil from '../../assets/logoDificil.png'
import logoVoltar from '../../assets/logoVoltar.png'
import { useNavigate } from 'react-router-dom';
//import { useTheme } from '../../context/useTheme';
//import backgroundImageDark from '../../assets/imgFundo.jpeg'
//import backgroundImageLight from '../../assets/imgFundoBranco.jpeg'
import { useJogo } from "../../context/JogoContext";
import { temInstituicao } from '../../services/auth';
import SalaExclusiva from '../../components/SalaExclusiva';

function Dificuldade()
 {

  // const [count, setCount] = useState(0)

  const [particulas, setParticulas] = useState([]);
  const [mostrarVideos, setMostrarVideos] = useState(false);
  const [erro, setErro] = useState(""); // mensagem na tela (antes o erro só ia para o console)
  const [iniciando, setIniciando] = useState(false); // evita clicar em duas dificuldades ao mesmo tempo
  const [salaAberta, setSalaAberta] = useState(false); // janela dos casos exclusivos (código da sala)

  useEffect(() => {
    const count = 60; // Total de partículas do seu código original
    const novasParticulas = Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 2.2 + 1; // Sua fórmula exata de tamanho
      const dur = (Math.random() * 3 + 2).toFixed(2); // Sua fórmula exata de duração
      const delay = (Math.random() * 4).toFixed(2); // Sua fórmula exata de atraso

      return {
        id: i,
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}vw`, // Posição horizontal do seu código
        top: `${Math.random() * 100}vh`,  // Posição vertical do seu código
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`
      };
    });
    
    setParticulas(novasParticulas);
  }, []);

  const navigate = useNavigate();
  //const { tema } = useTheme();
  //const backgroundImage = tema === 'Escuro' ? backgroundImageDark : backgroundImageLight;
  const { iniciarJogatina } = useJogo();
  //Casos exclusivos: a janela SalaExclusiva cuida do código da sala e chama o servidor. Quando o servidor devolve
  //os casos sorteados, a partida começa igual à normal (todo caso exclusivo é gravado como "Facil").
  function iniciarExclusivos(dados) {
    iniciarJogatina("Facil", dados.desafios, { idPartida: dados.id_partida ?? null, teste: Boolean(dados.teste) });
    setSalaAberta(false);
    setMostrarVideos(true);
  }

  async function iniciar(dificuldade) {
    if (iniciando) {
      return;
    }

    setIniciando(true);
    setErro("");

    try {
      const resposta = await fetch (`http://localhost:3000/desafios/dificuldade/${dificuldade}/aleatorios`);

      //404 = nenhum caso válido nesta dificuldade (ver regra de etapas no backend)
      if (resposta.status === 404){
        setErro("Ainda não há casos disponíveis para esta dificuldade. Escolha outra.");
        return;
      }

      if (!resposta.ok){
        throw new Error("Erro ao montar a jogatina.");
      }

      const dados = await resposta.json();

      iniciarJogatina(dificuldade, dados.desafios);

      setMostrarVideos(true);
    }
    catch (erroIniciar){
      console.error("Erro ao iniciar jogatina:", erroIniciar);
      setErro("Não foi possível iniciar a partida. Verifique a conexão com o servidor e tente de novo.");
    }
    finally {
      setIniciando(false);
    }
  }
  if (mostrarVideos) {
  return (
    <div className={styles.videoOverlay}>
      <video
        src="/videos/videoentrando.mp4"
        className={styles.video}
        autoPlay
        playsInline
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onEnded={() => navigate("/cliente")}
      />
      <button
        className={styles.continuarButton}
        onClick={() => navigate("/cliente")}
      >
        Pular
      </button>
    </div>
  );
}
  return (
    <div className={styles.container}>
      <TechSolveLogo size={130} className={styles.logo} />
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>

      {erro && (
        <p role="alert" style={{ position: 'relative', zIndex: 5, color: '#ff8a8a', textAlign: 'center', margin: '8px 16px' }}>
          {erro}
        </p>
      )}

      <div className={styles.stage}>
      <div className={styles.grid}></div>
      <div className={`${styles.hex} ${styles.bl}`}></div>
      <div className={`${styles.hex} ${styles.tr}`}></div>

      <svg className={styles.circuits} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {/* Circuitos superiores esquerdos */}
        <path id="pathA" className={styles['circuit-line']} d="M -20,20 L 60,20 L 130,90 L 300,90 L 340,130" />
        <path id="pathB" className={`${styles['circuit-line']} ${styles.bright}`} d="M -20,110 L 40,110 L 100,170 L 260,170 L 300,210" />
        <path id="pathC" className={styles['circuit-line']} d="M -20,220 L 70,220 L 150,300 L 360,300 L 420,360" />
        <path id="pathD" className={styles['circuit-line']} d="M -20,330 L 90,330 L 160,400 L 260,400" />

        {/* Circuitos inferiores direitos */}
        <path id="pathE" className={`${styles['circuit-line']} ${styles.bright}`} d="M 1620,560 L 1500,560 L 1440,500 L 1300,500 L 1230,570 L 1130,570" />
        <path id="pathF" className={styles['circuit-line']} d="M 1620,660 L 1520,660 L 1460,600 L 1350,600 L 1300,650" />
        <path id="pathG" className={styles['circuit-line']} d="M 1620,780 L 1480,780 L 1420,720 L 1330,720 L 1280,770 L 1160,770" />
        <path id="pathH" className={`${styles['circuit-line']} ${styles.bright}`} d="M 1620,880 L 1500,880 L 1440,820 L 1360,820" />

        {/* Nós de conexão piscantes */}
        <circle className={`${styles.node} ${styles.pulse}`} cx="60" cy="20" r="3" style={{ animationDelay: '0s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="130" cy="90" r="3" style={{ animationDelay: '0.4s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="300" cy="90" r="3" style={{ animationDelay: '0.8s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="100" cy="170" r="3" style={{ animationDelay: '1.1s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="260" cy="170" r="3" style={{ animationDelay: '0.3s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="150" cy="300" r="3" style={{ animationDelay: '0.6s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="360" cy="300" r="3" style={{ animationDelay: '1.4s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1500" cy="560" r="3" style={{ animationDelay: '0.2s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1300" cy="500" r="3" style={{ animationDelay: '0.9s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1230" cy="570" r="3" style={{ animationDelay: '1.3s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1350" cy="600" r="3" style={{ animationDelay: '0.5s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1420" cy="720" r="3" style={{ animationDelay: '0.7s' }} />
        <circle className={`${styles.node} ${styles.pulse}`} cx="1280" cy="770" r="3" style={{ animationDelay: '1.6s' }} />

        {/* Pulsos de energia móveis guiados */}
        <circle className={styles.traveler} r="3.2">
          <animateMotion dur="5.2s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathA" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="3.2">
          <animateMotion dur="6.4s" repeatCount="indefinite" begin="0.8s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathB" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="3.2">
          <animateMotion dur="5.8s" repeatCount="indefinite" begin="1.6s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathC" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="2.8">
          <animateMotion dur="4.6s" repeatCount="indefinite" begin="0.3s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathD" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="3.2">
          <animateMotion dur="5.6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathE" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="3">
          <animateMotion dur="6.8s" repeatCount="indefinite" begin="1s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathF" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="3.2">
          <animateMotion dur="6s" repeatCount="indefinite" begin="0.5s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathG" />
          </animateMotion>
        </circle>
        <circle className={styles.traveler} r="2.8">
          <animateMotion dur="5s" repeatCount="indefinite" begin="1.8s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
            <mpath href="#pathH" />
          </animateMotion>
        </circle>
      </svg>

        {/* Elemento de container das partículas injetadas */}
      <div className={styles.particlesContainer}>
        {particulas.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration
            }}
          />
        ))}
      </div>
    </div>

      <button className={`${styles.menuButton} ${styles.facil}`} onClick={() => iniciar("Facil")}>
        <span className={styles.iconWrap}>
          <img src={logoFacil} alt="Fácil" />
        </span>
        Fácil
      </button> 
      <button className={`${styles.menuButton} ${styles.normal}`} onClick={() => iniciar("Medio")}>
        <span className={styles.iconWrap}>
          <img src={logoNormal} alt="Normal" />
        </span>
        Normal
      </button>
      <button className={`${styles.menuButton} ${styles.dificil}`} onClick={() => iniciar("Dificil")}>
        <span className={styles.iconWrap}>
          <img src={logoDificil} alt="Difícil" />
        </span>
        Difícil
      </button>
      {temInstituicao() && (
        <button type="button" className={`${styles.menuButton} ${styles.exclusivo}`} onClick={() => setSalaAberta(true)}>
          Casos exclusivos
        </button>
      )}

      {salaAberta && (
        <SalaExclusiva onIniciar={iniciarExclusivos} onFechar={() => setSalaAberta(false)} />
      )}
      <button
        data-som="back"
        className={`${styles.voltarButton} ${styles.voltar}`}
        onClick={() => navigate('/')}
      >
        <span className={styles.iconWrap}>
          <img src={logoVoltar} alt="Voltar" />
        </span>
        Voltar
      </button>
    </div>
  );
}
export default Dificuldade;