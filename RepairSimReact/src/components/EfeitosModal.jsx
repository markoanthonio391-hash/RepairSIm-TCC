import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './EfeitosModal.module.css';
import { useTheme } from '../context/useTheme';
import { EFEITOS, NIVEIS, ROTULO_NIVEL } from '../context/preferencias';

export default function EfeitosModal({ aberto, onFechar }) {
  const { efeitos, setEfeito, setTodosEfeitos } = useTheme();
  const botaoFechar = useRef(null);
  const fecharRef = useRef(onFechar);
  fecharRef.current = onFechar;

  // foco no botão de fechar só ao abrir (não a cada clique)
  useEffect(() => {
    if (aberto) botaoFechar.current?.focus();
  }, [aberto]);

  // Esc fecha
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => { if (e.key === 'Escape') fecharRef.current(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  if (!aberto) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div className={styles.caixa} role="dialog" aria-modal="true" aria-labelledby="efeitos-titulo">
        <div className={styles.cabecalho}>
          <h2 id="efeitos-titulo" className={styles.titulo}>Efeitos de animação</h2>
          <button ref={botaoFechar} type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className={styles.atalhos}>
          <button type="button" className={styles.atalho} onClick={() => setTodosEfeitos('normal')}>Tudo normal</button>
          <button type="button" className={styles.atalho} onClick={() => setTodosEfeitos('reduzido')}>Reduzir tudo</button>
          <button type="button" className={styles.atalho} onClick={() => setTodosEfeitos('desligado')}>Desligar tudo</button>
        </div>

        <div className={styles.lista}>
          {EFEITOS.map(({ chave, rotulo, descricao }) => (
            <div key={chave} className={styles.linha}>
              <div className={styles.texto}>
                <strong className={styles.rotulo}>{rotulo}</strong>
                <small className={styles.descricao}>{descricao}</small>
              </div>
              <div className={styles.niveis} role="radiogroup" aria-label={rotulo}>
                {NIVEIS.map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    role="radio"
                    aria-checked={efeitos[chave] === nivel}
                    className={`${styles.nivel} ${efeitos[chave] === nivel ? styles.ativo : ''}`}
                    onClick={() => setEfeito(chave, nivel)}
                  >
                    {ROTULO_NIVEL[nivel]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.concluir} onClick={onFechar}>Concluído</button>
      </div>
    </div>,
    document.body
  );
}