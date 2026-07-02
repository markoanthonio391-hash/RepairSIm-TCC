import styles from './Config.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Config()
 {

 // const [count, setCount] = useState(0)
const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configurações</h1>
      <button className={`${styles.menuButton} ${styles.config}`} onClick={() => navigate(-1)} alt="Voltar">
        Voltar
      </button>
    </div>
  );
}
export default Config;