import styles from './Home.module.css';
import { useState, useEffect } from 'react'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import { useNavigate } from 'react-router-dom'
import logoSair from '../../assets/logoSair.png'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/iconPlay.png'
import logoHistorico from '../../assets/logoConq.png' // troque pelo ícone do histórico quando tiver
import { useLanguage } from '../../context/useLanguage';
import FundoAnimado from '../../components/FundoAnimado';


function Home() {
  const navigate = useNavigate();
  function lerUsuario() {
    try { return JSON.parse(localStorage.getItem('usuario')); }
    catch { return null; }
  }

  const [logado, setLogado] = useState(() => Boolean(lerUsuario()));

  const logout = () => {
    localStorage.removeItem('usuario');
    setLogado(false);
  };
  
           

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
      <FundoAnimado />

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

       {logado && (
        <button
          className={`${styles.menuButton} ${styles.historico} ${faseClasse}`}
          onClick={() => navigate('/Historico')} 
        > 
          <span className={`${styles.iconWrap} ${styles.historico}`}>
            <img src={logoHistorico} alt={t.historico} />
          </span>
          {t.historico}
        </button>
      )} 

      <button
        className={`${styles.menuButton} ${styles.sair} ${faseClasse}`}
        onClick={() => fecharJanela('Sair')}
      >
        <span className={`${styles.iconWrap} ${styles.sair}`}>
          <img src={logoSair} alt={t.sair} />
        </span>
        {t.sair}
      </button>

      {logado ? (
        <button className={`${styles.menuButton} ${styles.buttonLogin} ${faseClasse}`} onClick={logout}>
          {t.logout}
        </button>
      ) : (
        <button className={`${styles.menuButton} ${styles.buttonLogin} ${faseClasse}`} onClick={() => navigate('/login')}>
          {t.login}
        </button>
      )}
    </div>
    
  );
}
export default Home; 
  