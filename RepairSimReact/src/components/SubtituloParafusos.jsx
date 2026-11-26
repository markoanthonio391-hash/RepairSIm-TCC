import styles from './SubtituloParafusos.module.css';

// Troca cada "." do texto por uma cabeça de parafuso Phillips.
// O texto original continua acessível: use aria-label no elemento que envolve o componente.
function SubtituloParafusos({ texto = '' }) {
  const partes = texto.split('.');

  return partes.map((parte, i) => (
    <span key={i}>
      {parte}
      {i < partes.length - 1 && (
        <span
          className={styles.parafuso}
          aria-hidden="true"
          style={{
            '--inicio': `${(i * 37) % 60 - 20}deg`, // cada parafuso começa com um ângulo diferente
            '--atraso': `${i * 0.9}s`,              // e gira em momentos diferentes
          }}
        />
      )}
    </span>
  ));
}

export default SubtituloParafusos;