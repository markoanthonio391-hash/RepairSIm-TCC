import { useState } from 'react'
import styles from './Dificuldade.module.css'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import logoFacil from '../../assets/logoFacil.png'
import logoNormal from '../../assets/logoNormal.png'
import logoDificil from '../../assets/logoDificil.png'
import logoVoltar from '../../assets/logoVoltar.png'

function Dificuldade() {

 // const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>
      <button className={`${styles.menuButton} ${styles.facil}`} onClick={() => alert('Fácil')}><img src={logoFacil} alt="Fácil" className={styles.logoFacil}/>Fácil</button>
      <button className={`${styles.menuButton} ${styles.normal}`} onClick={() => alert('Normal')}><img src={logoNormal} alt="Normal" className={styles.logoNormal}/>Normal</button>
      <button className={`${styles.menuButton} ${styles.dificil}`} onClick={() => alert('Difícil')}><img src={logoDificil} alt="Difícil" className={styles.logoDificil}/>Difícil</button>
      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => alert('Voltar')}><img src={logoVoltar} alt="Voltar" className={styles.logoVoltar}/>Voltar</button>
    </div>
  );
}
export default Dificuldade;