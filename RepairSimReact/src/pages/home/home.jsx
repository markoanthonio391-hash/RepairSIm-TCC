import styles from './Home.module.css';
import { useState } from 'react'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import { useNavigate } from 'react-router-dom'
import logoSair from '../../assets/logoSair.png'
import logoConfig from '../../assets/logoConfig.png'
import logoConquistas from '../../assets/logoConq.png'
import logoPlay from '../../assets/logoPlay.png'

function Home() {
 const navigate = useNavigate()
 // const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>RepairSim</h1>
      <h2 className={styles.subtitle}>Aprenda. Repare. Evolua!</h2>
       
      <button className={`${styles.menuButton} ${styles.jogar}`} onClick={() => navigate('/dificuldade')}><img src={logoPlay} alt="Jogar" className={styles['logoPlay']} />Jogar</button>
      <button className={`${styles.menuButton} ${styles.config}`} onClick={() => alert('Configurações')}><img src={logoConfig} alt="Configurações" className={styles['logoConfig']} />Configurações</button>
      <button className={`${styles.menuButton} ${styles.conquistas}`} onClick={() => alert('Conquistas')}><img src={logoConquistas} alt="Conquistas" className={styles['logoConquistas']} />Conquistas</button>
      <button className={`${styles.menuButton} ${styles.sair}`} onClick={() => alert('Sair')}><img src={logoSair} alt="Sair" className={styles['logoSair']} />Sair</button>  
    </div>
    
  );
}
export default Home; 
  