import styles from './Config.module.css';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../../assets/imgFundo.jpeg'

function Config() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
      </div>

      <h1 className={styles.title}>CONFIGURAÇÕES</h1>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de tema</p>
        <button className={`${styles.optionButton} ${styles.tema}`} onClick={() => alert('Trocando')}>Alterar Tema</button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de idioma</p>
        <button className={`${styles.optionButton} ${styles.idioma}`} onClick={() => alert('Trocando')}>Alterar Idioma</button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de som</p>
        <button className={`${styles.optionButton} ${styles.som}`} onClick={() => alert('Trocando')}>Alterar Som</button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de fonte</p>
        <button className={`${styles.optionButton} ${styles.fonte}`} onClick={() => alert('Trocando')}>Alterar Fonte</button>
      </div>

      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}
export default Config;