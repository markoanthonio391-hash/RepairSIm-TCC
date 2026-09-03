// import { useState } from 'react'
import styles from './Dificuldade.module.css'
import TechSolveLogo from '../../assets/TechSolveLogo.png'
import logoFacil from '../../assets/logoFacil.png'
import logoNormal from '../../assets/logoNormal.png'
import logoDificil from '../../assets/logoDificil.png'
import logoVoltar from '../../assets/logoVoltar.png'
import backgroundImage from '../../assets/imgFundo.jpeg'
import { useNavigate } from 'react-router-dom';


function Dificuldade()
 {

 // const [count, setCount] = useState(0)
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckground} />
      </div>
      <div className={styles['tech-solve-logo']}>
        <img src={TechSolveLogo} alt="TechSolve Logo" className={`${styles.logoTechSolve} ${styles['tech-solve-logo']}`} />
      </div>
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>
      <button className={`${styles.menuButton} ${styles.facil}`} onClick={() => alert('/fácil')}><img src={logoFacil} alt="Fácil" className={styles.logoFacil}/>Fácil</button>
      <button className={`${styles.menuButton} ${styles.normal}`} onClick={() => navigate('/cliente')}><img src={logoNormal} alt="Normal" className={styles.logoNormal}/>Normal</button>
      <button className={`${styles.menuButton} ${styles.dificil}`} onClick={() => alert('/difícil')}><img src={logoDificil} alt="Difícil" className={styles.logoDificil}/>Difícil</button>
      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate('/')}><img src={logoVoltar} alt="Voltar" className={styles.logoVoltar}/>Voltar</button>

    </div>
  );
}
export default Dificuldade;