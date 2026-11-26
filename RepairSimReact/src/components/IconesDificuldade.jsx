import s from './IconesDificuldade.module.css';

// Ícones desenhados por código, baseados nos PNGs logoFacil / logoNormal / logoDificil.
// A velocidade das animações respeita --v-icones, igual aos ícones da Home.

const TRACO = '#2d2d2f'; // cinza-escuro dos olhos e bocas dos PNGs

const base = {
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: 'false',
};

const olhoLinha = {
  fill: 'none',
  stroke: TRACO,
  strokeWidth: 1.7,
  strokeLinecap: 'round',
};

// FÁCIL: rosto verde, olhos sorridentes (arcos para cima) e boca aberta.
// Ele "ri": a boca abre e fecha de leve, os olhos sobem e o rosto balança.
export function IconeFacil() {
  return (
    <svg {...base} className={s.icone}>
      <g className={s.rindo}>
        <circle cx="12" cy="12" r="10.5" fill="#1f9d4a" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        <g className={s.olhosFelizes}>
          <path d="M6.3 10 Q8.3 6.8 10.3 10" {...olhoLinha} />
          <path d="M13.7 10 Q15.7 6.8 17.7 10" {...olhoLinha} />
        </g>
        <path
          className={s.bocaRindo}
          d="M5.8 13.2 H18.2 Q18.2 20.3 12 20.3 Q5.8 20.3 5.8 13.2 Z"
          fill={TRACO}
          strokeLinejoin="round"
          stroke={TRACO}
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

// NORMAL: rosto amarelo, olhos redondos e boca reta.
// Os olhos piscam e passeiam de lado, e a boca se mexe como um "hmm".
export function IconeNormal() {
  return (
    <svg {...base} className={s.icone}>
      <circle cx="12" cy="12" r="10.5" fill="#f7d21e" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <g className={s.olhar}>
        <g className={`${s.piscar} ${s.piscarAtrasado}`}>
          <circle cx="8" cy="10" r="1.9" fill={TRACO} />
          <circle cx="16" cy="10" r="1.9" fill={TRACO} />
        </g>
      </g>
      <path className={s.bocaReta} d="M7 15.8 H17" stroke={TRACO} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// DIFÍCIL: rosto vermelho, olhos fechados (arcos para baixo) e boca de bico aberta.
// Ele suspira: o rosto enche e esvazia, a boca abre e fecha e sai um sopro de ar.
export function IconeDificil() {
  return (
    <svg {...base} className={s.icone}>
      <g className={s.sopro1}>
        <circle cx="20.5" cy="17.5" r="1.3" fill="#ffffff" />
      </g>
      <g className={s.sopro2}>
        <circle cx="21" cy="15" r="0.9" fill="#ffffff" />
      </g>
      <g className={s.respirar}>
        <circle cx="12" cy="12" r="10.5" fill="#e8271f" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        <g className={s.olhosCansados}>
          <path d="M6.3 9.4 Q8.3 12.4 10.3 9.4" {...olhoLinha} />
          <path d="M13.7 9.4 Q15.7 12.4 17.7 9.4" {...olhoLinha} />
        </g>
        <path
          className={s.bocaSuspiro}
          d="M6.6 19.4 Q7 14.2 12 14.2 Q17 14.2 17.4 19.4 Q17.4 20.4 16.4 20.4 H7.6 Q6.6 20.4 6.6 19.4 Z"
          fill={TRACO}
        />
      </g>
    </svg>
  );
}

// VOLTAR: o botão inteiro vira esta seta. Ela dá um empurrãozinho para a esquerda.
export function IconeVoltar() {
  return (
    <svg
      {...base}
      className={s.icone}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className={s.seta}>
        <path d="M20 12 H5" />
        <path d="M11 6 L5 12 L11 18" />
      </g>
    </svg>
  );
}