import { useState } from 'react'
import styles from './App.module.css'
import TechSolveLogoV2 from './assets/TechSolveLogoV2.jpeg'
function App() {

 // const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogoV2} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>
      <button className={`${styles.menuButton} ${styles.facil}`} onClick={() => alert('Fácil')}>Fácil</button>
      <button className={`${styles.menuButton} ${styles.normal}`} onClick={() => alert('Normal')}>Normal</button>
      <button className={`${styles.menuButton} ${styles.dificil}`} onClick={() => alert('Difícil')}>Difícil</button>
      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => alert('Voltar')}>Voltar</button>
    </div>
  );
}
export default App; 
  