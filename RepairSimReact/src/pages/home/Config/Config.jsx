import styles from './Config.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../../../context/useTheme';
import { useLanguage } from '../../../context/useLanguage';
import { useSound } from '../../../context/useSound';
import { TEMAS, FONTES, proximoValor } from '../../../context/preferencias';
import TechSolveLogo from '../../../components/TechSolveLogo';
import FundoAnimado from '../../../components/FundoAnimado';
import EfeitosModal from '../../../components/EfeitosModal';

const IDIOMAS = ['Português', 'English'];

function Config() {
  const navigate = useNavigate();

  const { tema, setTema, fonte, setFonte } = useTheme();
  const { volume, setVolume, play } = useSound();
  const { idioma, setIdioma } = useLanguage();

  const [sliderAberto, setSliderAberto] = useState(false);
  const [efeitosAberto, setEfeitosAberto] = useState(false);

  return (
    <div className={styles.container} data-efeito="menu">
      <FundoAnimado />

      <TechSolveLogo size={130} className={styles.logo} />
      <h1 className={styles.title}>CONFIGURAÇÕES</h1>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de tema</p>
        <button
          className={`${styles.optionButton} ${styles.tema}`}
          onClick={() => setTema((anterior) => proximoValor(TEMAS, anterior))}
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
        <button
          className={`${styles.optionButton} ${styles.som}`}
          onClick={() => setSliderAberto(aberto => !aberto)}
          aria-expanded={sliderAberto}
        >
          {volume === 0 ? 'Mudo' : `${volume}%`}
        </button>

        <div className={`${styles.sliderPanel} ${sliderAberto ? styles.sliderPanelAberto : ''}`}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            onPointerUp={() => play('click')}
            className={styles.slider}
            style={{ '--pct': `${volume}%` }}
            aria-label="Volume"
          />
          <span className={styles.sliderValor}>{volume}%</span>
        </div>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Alteração de fonte</p>
        <button className={`${styles.optionButton} ${styles.fonte}`} onClick={() => setFonte(prev => proximoValor(FONTES, prev))}>
          {fonte}
        </button>
      </div>

      <div className={styles.optionRow}>
        <p className={styles.optionLabel}>Efeitos de animação</p>
        <button
          className={`${styles.optionButton} ${styles.efeitos}`}
          onClick={() => setEfeitosAberto(true)}
          aria-haspopup="dialog"
        >
          Personalizar
        </button>
      </div>

      <button data-som="back" className={`${styles.voltarButton} ${styles.voltar}`} onClick={() => navigate(-1)}>
        Voltar
      </button>

      <EfeitosModal aberto={efeitosAberto} onFechar={() => setEfeitosAberto(false)} />
    </div>
  );
}
export default Config;