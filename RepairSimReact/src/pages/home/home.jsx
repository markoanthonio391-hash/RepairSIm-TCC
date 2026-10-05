{/*import styles from './Home.module.css';
import { useState, useEffect } from 'react'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import { useNavigate } from 'react-router-dom'
import logoSair from '../../assets/logoSair.png'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/iconPlay.png'
import { useTheme } from '../../context/useTheme';
import backgroundImageDark from '../../assets/imgFundo.jpeg'
import backgroundImageLight from '../../assets/imgFundoBranco.jpeg'
import { useLanguage } from '../../context/useLanguage';

function Home() {
  const navigate = useNavigate();
  
  const { tema } = useTheme();
  const backgroundImage = tema === 'Claro' ? backgroundImageLight : backgroundImageDark;
  
  const claro = tema === 'Claro';

  const { t } = useLanguage(); // Adicione esta linha para obter a função de tradução

  const [estaAberta, setEstaAberta] = useState(true);
  const [ligando, setLigando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLigando(false), 4500);
    return () => clearTimeout(timer);
    }, []);

  const fecharJanela = () => {
    setEstaAberta(false);
  };

  if (!estaAberta) {
    return null;
  }

  const faseClasse = ligando ? styles.ligando : styles.ligado;

  return (
    <div className={`${styles.container} ${claro ? styles.temaClaro : ''}`}>
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
        <div className={styles.circuitoGlow}></div>
      </div>

      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>

      <h1 className={styles.title}>{t.homeTitle}</h1>
      <h2 className={styles.subtitle}>{t.homeSubtitle}</h2>

      <button
        className={`${styles.menuButton} ${styles.jogar} ${faseClasse}`}
        onClick={() => navigate('/dificuldade')}
      >
        <span className={`${styles.iconWrap} ${styles.play}`}>
          <img src={logoPlay} alt={t.jogar} />
        </span>
        {t.jogar}
      </button>

      <button
        className={`${styles.menuButton} ${styles.config} ${faseClasse}`}
        onClick={() => navigate('/Config')}
      >
        <span className={`${styles.iconWrap} ${styles.config}`}>
          <img src={logoConfig} alt={t.configuracoes} />
        </span>
        {t.configuracoes}
      </button>

      <button
        className={`${styles.menuButton} ${styles.conquistas} ${faseClasse}`}
        onClick={() => navigate('/Conquistas')}
      >
        <span className={`${styles.iconWrap} ${styles.conquistas}`}>
          <img src={logoConquistas} alt={t.conquistas} />
        </span>
        {t.conquistas}
      </button>

      <button
        className={`${styles.menuButton} ${styles.sair} ${faseClasse}`}
        onClick={() => fecharJanela('Sair')}
      >
        <span className={`${styles.iconWrap} ${styles.sair}`}>
          <img src={logoSair} alt={t.sair} />
        </span>
        {t.sair}
      </button>

      <button
        className={`${styles.menuButton} ${styles.buttonLogin} ${faseClasse}`}
        onClick={() => navigate('/login')}
      >
        {t.login}
      </button>
    </div>
    
  );
}
export default Home; 
*/}

import styles from './Home.module.css';
import { useState, useEffect } from 'react'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import { useNavigate } from 'react-router-dom'
import logoSair from '../../assets/logoSair.png'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/iconPlay.png'
import { useTheme } from '../../context/useTheme';
// import backgroundImageDark from '../../assets/imgFundo.jpeg'
// import backgroundImageLight from '../../assets/imgFundoBranco.jpeg'
import { useLanguage } from '../../context/useLanguage';

function Home() {
  const navigate = useNavigate();

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

  

  // const { tema } = useTheme();
  // const backgroundImage = tema === 'Claro' ? backgroundImageLight : backgroundImageDark;
  
  // const claro = tema === 'Claro';               

  const { t } = useLanguage(); // Adicione esta linha para obter a função de tradução

  const [estaAberta, setEstaAberta] = useState(true);
  const [ligando, setLigando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLigando(false), 4500);
    return () => clearTimeout(timer);
    }, []);

  const fecharJanela = () => {
    setEstaAberta(false);
  };

  if (!estaAberta) {
    return null;
  }

  const faseClasse = ligando ? styles.ligando : styles.ligado;

  return (
    <div className={styles.container}>
      {/*<div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
        <div className={styles.circuitoGlow}></div>
      </div>*/}
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

      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>

      <h1 className={styles.title}>{t.homeTitle}</h1>
      <h2 className={styles.subtitle}>{t.homeSubtitle}</h2>

      <button
        className={`${styles.menuButton} ${styles.jogar} ${faseClasse}`}
        onClick={() => navigate('/dificuldade')}
      >
        <span className={`${styles.iconWrap} ${styles.play}`}>
          <img src={logoPlay} alt={t.jogar} />
        </span>
        {t.jogar}
      </button>

      <button
        className={`${styles.menuButton} ${styles.config} ${faseClasse}`}
        onClick={() => navigate('/Config')}
      >
        <span className={`${styles.iconWrap} ${styles.config}`}>
          <img src={logoConfig} alt={t.configuracoes} />
        </span>
        {t.configuracoes}
      </button>

      <button
        className={`${styles.menuButton} ${styles.conquistas} ${faseClasse}`}
        onClick={() => navigate('/Conquistas')}
      >
        <span className={`${styles.iconWrap} ${styles.conquistas}`}>
          <img src={logoConquistas} alt={t.conquistas} />
        </span>
        {t.conquistas}
      </button>

      <button
        className={`${styles.menuButton} ${styles.sair} ${faseClasse}`}
        onClick={() => fecharJanela('Sair')}
      >
        <span className={`${styles.iconWrap} ${styles.sair}`}>
          <img src={logoSair} alt={t.sair} />
        </span>
        {t.sair}
      </button>

      <button
        className={`${styles.menuButton} ${styles.buttonLogin} ${faseClasse}`}
        onClick={() => navigate('/login')}
      >
        {t.login}
      </button>
    </div>
    
  );
}
export default Home; 
  