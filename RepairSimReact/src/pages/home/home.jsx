import styles from './Home.module.css';
import { useState, useEffect } from 'react'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import { useNavigate } from 'react-router-dom'
import logoSair from '../../assets/logoSair.png'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/iconPlay.png'
import backgroundImage from '../../assets/imgFundo.jpeg'

function Home() {
 const navigate = useNavigate()
 const [estaAberta, setEstaAberta] = useState(true)
 const [ligando, setLigando] = useState(true)

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
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
        <div className={styles.circuitoGlow}></div>
      </div>

      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>

      <h1 className={styles.title}>RepairSim</h1>
      <h2 className={styles.subtitle}>Aprenda. Repare. Evolua!</h2>

      <button
        className={`${styles.menuButton} ${styles.jogar} ${faseClasse}`}
        onClick={() => navigate('/dificuldade')}
      >
        <span className={`${styles.iconWrap} ${styles.play}`}>
          <img src={logoPlay} alt="Jogar" />
        </span>
        Jogar
      </button>

      <button
        className={`${styles.menuButton} ${styles.config} ${faseClasse}`}
        onClick={() => navigate('/Config')}
      >
        <span className={`${styles.iconWrap} ${styles.config}`}>
          <img src={logoConfig} alt="Configurações" />
        </span>
        Configurações
      </button>

      <button
        className={`${styles.menuButton} ${styles.conquistas} ${faseClasse}`}
        onClick={() => navigate('/Conquistas')}
      >
        <span className={`${styles.iconWrap} ${styles.conquistas}`}>
          <img src={logoConquistas} alt="Conquistas" />
        </span>
        Conquistas
      </button>

      <button
        className={`${styles.menuButton} ${styles.sair} ${faseClasse}`}
        onClick={() => fecharJanela('Sair')}
      >
        <span className={`${styles.iconWrap} ${styles.sair}`}>
          <img src={logoSair} alt="Sair" />
        </span>
        Sair
      </button>

      <button
        className={`${styles.menuButton} ${styles.buttonLogin} ${faseClasse}`}
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>
    
  );
}
export default Home; 
  