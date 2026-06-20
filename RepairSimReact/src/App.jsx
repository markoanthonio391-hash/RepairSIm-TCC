//import { useState } from 'react'
import styles from './App.module.css'

function App() {

  //const [count, setCount] = useState(0)

  return (
    <div className={styles.container}>
      <h1>RepairSim</h1>
      <h2>Aprenda. Repare. Evolua!</h2>
      <button className={styles.jogar} onClick={() => alert('Jogar')}>Jogar</button>
      <button className={styles.config} onClick={() => alert('Configurações')}>Configurações</button>
      <button className={styles.conquistas} onClick={() => alert('Conquistas')}>Conquistas</button>
      <button className={styles.sair} onClick={() => alert('Sair')}>Sair</button>  
    </div>
  );
}
export default App; 
  