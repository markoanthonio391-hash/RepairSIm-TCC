import styles from './Home.module.css';
import { useState, useEffect } from 'react'
import TechSolveLogo from '../../components/TechSolveLogo'
import { useNavigate } from 'react-router-dom'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/iconPlay.png'
import logoHistorico from '../../assets/logoConq.png' // troque pelo ícone do histórico quando tiver
import { useLanguage } from '../../context/useLanguage';
import FundoAnimado from '../../components/FundoAnimado';
import { lerUsuario, validarSessao, sairDaConta, ehAdmin } from '../../services/auth';


function Home() {
  const navigate = useNavigate();
  const [logado, setLogado] = useState(() => Boolean(lerUsuario()));
  const [admin, setAdmin] = useState(() => ehAdmin()); // só mostra/esconde o botão; quem protege é o servidor (403)

  // confirma com o servidor se o login (cookie) ainda é válido. Se expirou, volta para "Login"
  useEffect(() => {
    if (!lerUsuario()) return;
    validarSessao().then((valida) => {
      setLogado(valida);
      setAdmin(valida && ehAdmin()); // validarSessao atualizou papel/instituição no localStorage
    });
  }, []);

  const logout = async () => {
    await sairDaConta();
    setLogado(false);
    setAdmin(false);
  };
  
           

  const { t } = useLanguage(); // Adicione esta linha para obter a função de tradução

  const [estaAberta, setEstaAberta] = useState(true);
  const [ligando, setLigando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLigando(false), 4500);
    return () => clearTimeout(timer);
    }, []);

  if (!estaAberta) {
    return null;
  }

  const faseClasse = ligando ? styles.ligando : styles.ligado;

  return (
    <div className={styles.container}>
      <FundoAnimado />
      <TechSolveLogo size={130} className={styles.logo} />

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

      {logado && admin && (
        <button
          type="button"
          className={`${styles.menuButton} ${styles.historico} ${faseClasse}`}
          onClick={() => navigate('/cadastrar-desafio')}
        >
          Cadastrar desafio
        </button>
      )}

      {logado && admin && (
        <button
          type="button"
          className={`${styles.menuButton} ${styles.historico} ${faseClasse}`}
          onClick={() => navigate('/resultados-professor')}
        >
          Resultados dos alunos
        </button>
      )}

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
  