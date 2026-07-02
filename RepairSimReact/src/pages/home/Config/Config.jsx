import styles from './Config.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Config()
 {

 // const [count, setCount] = useState(0)
const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> CONFIGURAÇÕES </h1>
      <div className={styles.containerTema}> 
        <text className={styles.textTema}>Alteração de tema</text>
        <button className={`${styles.temaButton} ${styles.buttonTema}`} onClick={() => alert('Trocando')} alt="Trocar tema"> Alterar Tema</button>
      </div>
      <button className={`${styles.menuButton} ${styles.config}`} onClick={() => navigate(-1)} alt="Voltar">
        Voltar
      </button>
    </div>

  );
}
export default Config;