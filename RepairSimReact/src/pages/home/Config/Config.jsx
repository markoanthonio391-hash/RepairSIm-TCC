import styles from './Config.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
//import { useTheme } from '../../../context/useTheme';
//import backgroundDark from '../../../assets/imgFundo.jpeg'
//import backgroundLight from '../../../assets/imgFundoBranco.jpeg'
import { useLanguage } from '../../../context/useLanguage';
import { useSound } from '../../../context/useSound';

const IDIOMAS = ['Português', 'English'];
const FONTES = ['Padrão', 'Grande'];

function proximoValor(lista, atual) {
  const index = lista.indexOf(atual);
  return lista[(index + 1) % lista.length];
}

function Config() {
  const navigate = useNavigate()
  //const { tema, setTema } = useTheme();
  
  const { volume, setVolume, play } = useSound();
  const [sliderAberto, setSliderAberto] = useState(false);
  
  const { t } = useLanguage(); // Adicione esta linha para obter a função de tradução

  const [idioma, setIdioma] = useState(() => localStorage.getItem('config_idioma') || IDIOMAS[0]);
  const [fonte, setFonte] = useState(() => localStorage.getItem('config_fonte') || FONTES[0]);

  useEffect(() => { localStorage.setItem('config_idioma', idioma); }, [idioma]);
  useEffect(() => { localStorage.setItem('config_fonte', fonte); }, [fonte]);

  
  const fonteGrande = fonte === 'Grande';

  //const claro = tema === 'Claro';
  //const backgroundImage = claro ? backgroundLight : backgroundDark;


  const [particulas, setParticulas] = useState([]);

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

  return (
    <div className={styles.container}>      
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
      
      
      
      
      <h1 className={styles.title}>CONFIGURAÇÕES</h1>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de tema</p>
        {/* A troca de tema está desligada (o useTheme está comentado acima), então o botão fica desativado em vez de dar erro ao clicar.
            Para religar: descomente o useTheme e volte o onClick para setTema(prev => proximoValor(['Escuro', 'Claro'], prev)). */}
        <button
          type="button"
          className={`${styles.optionButton} ${styles.tema}`}
          disabled
          title="Em breve"
        >
          Tema
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de idioma</p>
        <button className={`${styles.optionButton} ${styles.idioma}`} onClick={() => setIdioma(prev => proximoValor(IDIOMAS, prev))}>
          {idioma}
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de som</p>
        <button
          className={`${styles.optionButton} ${styles.som}`}
          onClick={() => setSliderAberto(aberto => !aberto)}
          aria-expanded={sliderAberto}
        >
          {volume === 0 ? 'Mudo' : `${volume}%`}
        </button>

        <div className={`${styles.sliderPanel} ${sliderAberto ? styles.sliderPanelAberto : ''}`}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            onPointerUp={() => play('click')}   // ao soltar, toca um clique para você ouvir o nível
            className={styles.slider}
            style={{ '--pct': `${volume}%` }}
            aria-label="Volume"
          />
          <span className={styles.sliderValor}>{volume}%</span>
        </div>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de fonte</p>
        <button className={`${styles.optionButton} ${styles.fonte}`} onClick={() => setFonte(prev => proximoValor(FONTES, prev))}>
          {fonte}
        </button>
      </div>

      <button data-som="back" className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}
export default Config;

      {/*<div className={styles.bckground}> ${claro ? styles.temaClaro : ''} ${fonteGrande ? styles.fonteGrande : ''}`
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
      </div>
      */}