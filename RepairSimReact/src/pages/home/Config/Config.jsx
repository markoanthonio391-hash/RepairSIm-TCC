// // import styles from './Config.module.css';
// // import { useNavigate } from 'react-router-dom';
// // import backgroundImage from '../../../assets/imgFundo.jpeg'

// // function Config() {
// //   const navigate = useNavigate();

// //   return (
// //     <div className={styles.container}>
// //       <div className={styles.bckground}>
// //         <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
// //       </div>

// //       <h1 className={styles.title}>CONFIGURAÇÕES</h1>

// //       <div className={styles.optionRow}>
// //         <p className={styles.optionLabel}>Alteração de tema</p>
// //         <button className={`${styles.optionButton} ${styles.tema}`} onClick={() => alert('Trocando')}>Alterar Tema</button>
// //       </div>

// //       <div className={styles.optionRow}>
// //         <p className={styles.optionLabel}>Alteração de idioma</p>
// //         <button className={`${styles.optionButton} ${styles.idioma}`} onClick={() => alert('Trocando')}>Alterar Idioma</button>
// //       </div>

// //       <div className={styles.optionRow}>
// //         <p className={styles.optionLabel}>Alteração de som</p>
// //         <button className={`${styles.optionButton} ${styles.som}`} onClick={() => alert('Trocando')}>Alterar Som</button>
// //       </div>

// //       <div className={styles.optionRow}>
// //         <p className={styles.optionLabel}>Alteração de fonte</p>
// //         <button className={`${styles.optionButton} ${styles.fonte}`} onClick={() => alert('Trocando')}>Alterar Fonte</button>
// //       </div>

// //       <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
// //         Voltar
// //       </button>
// //     </div>
// //   );
// // }
// // export default Config;

// import styles from './Config.module.css';
// import { useNavigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import backgroundImage from '../../../assets/imgFundo.jpeg'

// const TEMAS = ['Escuro', 'Claro'];
// const IDIOMAS = ['Português', 'English'];
// const VOLUMES = ['Alto', 'Médio', 'Baixo', 'Mudo'];
// const FONTES = ['Padrão', 'Grande'];

// function proximoValor(lista, atual) {
//   const index = lista.indexOf(atual);
//   return lista[(index + 1) % lista.length];
// }

// function Config() {
//   const navigate = useNavigate();

//   const [tema, setTema] = useState(() => localStorage.getItem('config_tema') || TEMAS[0]);
//   const [idioma, setIdioma] = useState(() => localStorage.getItem('config_idioma') || IDIOMAS[0]);
//   const [volume, setVolume] = useState(() => localStorage.getItem('config_volume') || VOLUMES[0]);
//   const [fonte, setFonte] = useState(() => localStorage.getItem('config_fonte') || FONTES[0]);

//   useEffect(() => { localStorage.setItem('config_tema', tema); }, [tema]);
//   useEffect(() => { localStorage.setItem('config_idioma', idioma); }, [idioma]);
//   useEffect(() => { localStorage.setItem('config_volume', volume); }, [volume]);
//   useEffect(() => { localStorage.setItem('config_fonte', fonte); }, [fonte]);

//   const claro = tema === 'Claro';
//   const fonteGrande = fonte === 'Grande';

//   return (
//     <div className={`${styles.container} ${claro ? styles.temaClaro : ''} ${fonteGrande ? styles.fonteGrande : ''}`}>
//       <div className={styles.bckground}>
//         <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
//       </div>

//       <h1 className={styles.title}>CONFIGURAÇÕES</h1>

//       <div className={styles.optionRow}>
//         <p className={styles.optionLabel}>Alteração de tema</p>
//         <button
//           className={`${styles.optionButton} ${styles.tema}`}
//           onClick={() => setTema(prev => proximoValor(TEMAS, prev))}
//         >
//           {tema}
//         </button>
//       </div>

//       <div className={styles.optionRow}>
//         <p className={styles.optionLabel}>Alteração de idioma</p>
//         <button
//           className={`${styles.optionButton} ${styles.idioma}`}
//           onClick={() => setIdioma(prev => proximoValor(IDIOMAS, prev))}
//         >
//           {idioma}
//         </button>
//       </div>

//       <div className={styles.optionRow}>
//         <p className={styles.optionLabel}>Alteração de som</p>
//         <button
//           className={`${styles.optionButton} ${styles.som}`}
//           onClick={() => setVolume(prev => proximoValor(VOLUMES, prev))}
//         >
//           {volume}
//         </button>
//       </div>

//       <div className={styles.optionRow}>
//         <p className={styles.optionLabel}>Alteração de fonte</p>
//         <button
//           className={`${styles.optionButton} ${styles.fonte}`}
//           onClick={() => setFonte(prev => proximoValor(FONTES, prev))}
//         >
//           {fonte}
//         </button>
//       </div>

//       <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
//         Voltar
//       </button>
//     </div>
//   );
// }
// export default Config;

import styles from './Config.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../context/useTheme';
import backgroundDark from '../../../assets/imgFundo.jpeg'
import backgroundLight from '../../../assets/imgFundoBranco.jpeg'
// import { useLanguage } from '../../../context/useLanguage';

const IDIOMAS = ['Português', 'English'];
const VOLUMES = ['Alto', 'Médio', 'Baixo', 'Mudo'];
const FONTES = ['Padrão', 'Grande'];

function proximoValor(lista, atual) {
  const index = lista.indexOf(atual);
  return lista[(index + 1) % lista.length];
}

function Config() {
  const navigate = useNavigate()
  const { tema, setTema } = useTheme();

  // const { t } = useLanguage(); // Adicione esta linha para obter a função de tradução

  const [idioma, setIdioma] = useState(() => localStorage.getItem('config_idioma') || IDIOMAS[0]);
  const [volume, setVolume] = useState(() => localStorage.getItem('config_volume') || VOLUMES[0]);
  const [fonte, setFonte] = useState(() => localStorage.getItem('config_fonte') || FONTES[0]);

  useEffect(() => { localStorage.setItem('config_idioma', idioma); }, [idioma]);
  useEffect(() => { localStorage.setItem('config_volume', volume); }, [volume]);
  useEffect(() => { localStorage.setItem('config_fonte', fonte); }, [fonte]);

  
  const fonteGrande = fonte === 'Grande';

  const claro = tema === 'Claro';
  const backgroundImage = claro ? backgroundLight : backgroundDark;

  return (
    <div className={`${styles.container} ${claro ? styles.temaClaro : ''} ${fonteGrande ? styles.fonteGrande : ''}`}>
      <div className={styles.bckground}>
        <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
      </div>

      <h1 className={styles.title}>CONFIGURAÇÕES</h1>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de tema</p>
        <button
          className={`${styles.optionButton} ${styles.tema}`}
          onClick={() => setTema(prev => proximoValor(['Escuro', 'Claro'], prev))}
        >
          {tema}
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de idioma</p>
        <button className={`${styles.optionButton} ${styles.idioma}`} onClick={() => setIdioma(prev => proximoValor(IDIOMAS, prev))}>
          {idioma}
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de som</p>
        <button className={`${styles.optionButton} ${styles.som}`} onClick={() => setVolume(prev => proximoValor(VOLUMES, prev))}>
          {volume}
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de fonte</p>
        <button className={`${styles.optionButton} ${styles.fonte}`} onClick={() => setFonte(prev => proximoValor(FONTES, prev))}>
          {fonte}
        </button>
      </div>

      <button className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}
export default Config;