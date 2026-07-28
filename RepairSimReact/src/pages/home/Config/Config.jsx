import styles from './Config.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bckgroundImage from '../../../assets/imgFundoBranco.jpeg'


function Config()
 {

 // const [count, setCount] = useState(0)
const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> CONFIGURAÇÕES </h1>
      <text className={styles.textTema}>Alteração de tema</text>
      <button className={styles.buttonTema} onClick={() => alert('Trocando')} alt="Trocar tema"> Alterar Tema</button>
      <text className={styles.textIdioma}>Alteração de idioma</text>
      <button className={styles.buttonIdioma} onClick={() => alert('Trocando')} alt="Trocar idioma"> Alterar Idioma</button>
      <text className={styles.textSom}>Alteração de som</text>
      <button className={styles.buttonSom} onClick={() => alert('Trocando')} alt="Trocar som"> Alterar Som</button>
      <text className={styles.textFonte}>Alteração de fonte</text>
      <button className={styles.buttonFonte} onClick={() => alert('Trocando')} alt="Trocar fonte"> Alterar Fonte</button>
      <div className={styles.bckground}>
        <img src={bckgroundImage} alt="Background" className={styles.bckground} />
      </div>
      <button className={`${styles.menuButton} ${styles.config}`} onClick={() => navigate(-1)} alt="Voltar">
        Voltar
      </button>
    </div>

  );
}
export default Config;