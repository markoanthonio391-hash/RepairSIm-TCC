import styles from './App.module.css';
import { useState } from 'react'
import TechSolveLogo from './assets/TechSolveLogo.png'
function App() {

 // const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>RepairSim</h1>
      <h2 className={styles.subtitle}>Aprenda. Repare. Evolua!</h2>
      <button className={`${styles.menuButton} ${styles.jogar}`} onClick={() => alert('Jogar')}>Jogar</button>
      <button className={`${styles.menuButton} ${styles.config}`} onClick={() => alert('Configurações')}>Configurações</button>
      <button className={`${styles.menuButton} ${styles.conquistas}`} onClick={() => alert('Conquistas')}>Conquistas</button>
      <button className={`${styles.menuButton} ${styles.sair}`} onClick={() => alert('Sair')}>Sair</button>  
    </div>
  );
}
export default App; 
  