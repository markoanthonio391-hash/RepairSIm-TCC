import { useState } from 'react'
import styles from './Dificuldade.module.css'
function Dificuldade() {

 // const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>
      <button className={`${styles.menuButton} ${styles.facil}`} onClick={() => alert('Fácil')}>Fácil</button>
      <button className={`${styles.menuButton} ${styles.normal}`} onClick={() => alert('Normal')}>Normal</button>
      <button className={`${styles.menuButton} ${styles.dificil}`} onClick={() => alert('Difícil')}>Difícil</button>
      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => alert('Voltar')}>Voltar</button>
    </div>
  );
}
export default Dificuldade;