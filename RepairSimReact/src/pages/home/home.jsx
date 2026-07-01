import styles from './Home.module.css';
import { useState } from 'react'
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
 
 const fecharJanela = () => {
  setEstaAberta(false);
 };

 if (!estaAberta) {
  return null;
 }
  return (
    <div className={styles.container}>
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckground} />
      </div>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>RepairSim</h1>
      <h2 className={styles.subtitle}>Aprenda. Repare. Evolua!</h2>
       
      <button className={`${styles.menuButton} ${styles.jogar} ${styles['button:focus-visible']}`} onClick={() => navigate('/dificuldade')}><img src={logoPlay} alt="Jogar" className={styles['logoPlay']} />Jogar</button>
      <button className={`${styles.menuButton} ${styles.config} ${styles['button:focus-visible']}`} onClick={() => navigate('/Config')}><img src={logoConfig} alt="Configurações" className={styles['logoConfig']} />Configurações</button>
      <button className={`${styles.menuButton} ${styles.conquistas} ${styles['button:focus-visible']}`} onClick={() => alert('Conquistas')}><img src={logoConquistas} alt="Conquistas" className={styles['logoConquistas']} />Conquistas</button>
      <button className={`${styles.menuButton} ${styles.sair} ${styles['button:focus-visible']}`} onClick={() => fecharJanela('Sair')}><img src={logoSair} alt="Sair" className={styles['logoSair']} />Sair</button>  
    </div>
    
  );
}
export default Home; 
  