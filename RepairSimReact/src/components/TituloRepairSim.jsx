import styles from './TituloRepairSim.module.css';

function ChaveInglesa() {
  return (
    <svg
      className={styles.chaveSvg}
      style={{ width: '0.8em', height: '0.8em' }}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// Letra "A" com uma engrenagem encaixada no canto superior esquerdo
// "A" dentro de uma engrenagem, com trilha de circuito e uma chave inglesa
function LetraA() {
  return (
    <svg
      className={styles.letraASvg}
      style={{ width: '1.15em', height: '1.15em' }}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* engrenagem (só ela gira) */}
      <g className={styles.engrenagemA}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect
            key={a}
            x="-7" y="-47" width="14" height="14" rx="2.5"
            fill="#2fa8e6"
            transform={`translate(50 50) rotate(${a})`}
          />
        ))}
        <circle cx="50" cy="50" r="36" fill="#2fa8e6" />
        <circle cx="50" cy="50" r="29" fill="#1f8fcb" />
      </g>

      {/* sombra azul-escura do A */}
      <path
        d="M31 76 L50 27 L69 76"
        transform="translate(0 5)"
        stroke="#0b3f66" strokeWidth="10" strokeLinejoin="miter" strokeLinecap="butt"
      />

      {/* letra A */}
      <path
        d="M31 76 L50 27 L69 76"
        stroke="#ffffff" strokeWidth="10" strokeLinejoin="miter" strokeLinecap="butt"
      />

      {/* barra do A como trilha de circuito */}
      <path d="M39 60 H61" stroke="#ffffff" strokeWidth="6" strokeLinecap="butt" />
      <path d="M50 60 V70" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="50" cy="72" r="3" fill="#ffffff" />

      {/* chave inglesa no canto inferior direito */}
      <g transform="translate(62 62) scale(1.45)">
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          stroke="#0b3f66" strokeWidth="4.6" strokeLinejoin="round" strokeLinecap="round"
        />
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          fill="#ffffff" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// "RepairSim" com a chave inglesa antes do R e o "A" com engrenagem
const PARTES = ['R', 'e', 'p', 'A', 'i', 'r', 'S', 'i', 'm'];

export default function TituloRepairSim() {
  return (
    <span className={styles.palavra} aria-hidden="true">
      <span className={`${styles.item} ${styles.chave}`} style={{ '--i': 0 }}>
        <ChaveInglesa />
      </span>
      {PARTES.map((parte, i) => (
        <span key={i} className={styles.item} style={{ '--i': i + 1 }}>
          {parte === 'A' ? <LetraA /> : parte}
        </span>
      ))}
    </span>
  );
}