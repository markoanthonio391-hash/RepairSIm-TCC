import { useEffect, useMemo, useState } from 'react';
import styles from './FundoAnimado.module.css';

// Fundo animado igual ao da Home (grade, hexágonos, circuitos, pulsos e partículas),
// agora ADAPTÁVEL ao tamanho da tela:
//  - o desenho é medido em pixels reais da janela (e refeito quando ela muda de tamanho);
//  - as linhas ficam ancoradas nas bordas e a colmeia nos cantos (inferior esquerdo e
//    superior direito), com escala proporcional ao tamanho da janela;
//  - a escala é limitada para as linhas novas nunca encostarem na colmeia.
//
// Uso: <FundoAnimado />   (opcional: <FundoAnimado particulas={40} />)

// ---------------------------------------------------------------------------
// Medidas do desenho original (espaço de projeto 1600x900)
// ---------------------------------------------------------------------------
const PROJETO_W = 1600;
const PROJETO_H = 900;

// Trilhas ancoradas no canto SUPERIOR ESQUERDO (A-D antigas, I-J novas)
// e no canto INFERIOR DIREITO (E-H antigas, K-L novas).
const TRILHAS_ESQ = [
  { id: 'fa-pathA', bright: false, d: 'M -20,20 L 60,20 L 130,90 L 300,90 L 340,130' },
  { id: 'fa-pathB', bright: true,  d: 'M -20,110 L 40,110 L 100,170 L 260,170 L 300,210' },
  { id: 'fa-pathC', bright: false, d: 'M -20,220 L 70,220 L 150,300 L 360,300 L 420,360' },
  { id: 'fa-pathD', bright: false, d: 'M -20,330 L 90,330 L 160,400 L 260,400' },
  { id: 'fa-pathI', bright: true,  d: 'M -20,440 L 60,440 L 115,495 L 270,495 L 320,445' },
  { id: 'fa-pathJ', bright: false, d: 'M -20,530 L 80,530 L 130,580 L 250,580' },
];

const TRILHAS_DIR = [
  { id: 'fa-pathE', bright: true,  d: 'M 1620,560 L 1500,560 L 1440,500 L 1300,500 L 1230,570 L 1130,570' },
  { id: 'fa-pathF', bright: false, d: 'M 1620,660 L 1520,660 L 1460,600 L 1350,600 L 1300,650' },
  { id: 'fa-pathG', bright: false, d: 'M 1620,780 L 1480,780 L 1420,720 L 1330,720 L 1280,770 L 1160,770' },
  { id: 'fa-pathH', bright: true,  d: 'M 1620,880 L 1500,880 L 1440,820 L 1360,820' },
  { id: 'fa-pathK', bright: true,  d: 'M 1620,460 L 1540,460 L 1485,405 L 1330,405 L 1280,455' },
  { id: 'fa-pathL', bright: false, d: 'M 1620,370 L 1520,370 L 1470,320 L 1350,320' },
];

// [x, y, atraso da piscada] — separados por lado
const NOS_ESQ = [
  [60, 20, 0], [130, 90, 0.4], [300, 90, 0.8], [100, 170, 1.1], [260, 170, 0.3],
  [150, 300, 0.6], [360, 300, 1.4],
  [60, 440, 0.2], [115, 495, 0.9], [270, 495, 0.5], [320, 445, 1.2],
  [80, 530, 0.4], [130, 580, 1.0], [250, 580, 0.7],
];

const NOS_DIR = [
  [1500, 560, 0.2], [1300, 500, 0.9], [1230, 570, 1.3], [1350, 600, 0.5],
  [1420, 720, 0.7], [1280, 770, 1.6],
  [1540, 460, 0.6], [1485, 405, 1.1], [1330, 405, 0.3], [1280, 455, 0.8],
  [1520, 370, 0.2], [1470, 320, 1.3], [1350, 320, 0.5],
];

// Pulsos de luz que percorrem cada trilha
const PULSOS = {
  'fa-pathA': { dur: '5.2s', begin: '0s',   r: 3.2, rotate: true },
  'fa-pathB': { dur: '6.4s', begin: '0.8s', r: 3.2 },
  'fa-pathC': { dur: '5.8s', begin: '1.6s', r: 3.2 },
  'fa-pathD': { dur: '4.6s', begin: '0.3s', r: 2.8 },
  'fa-pathI': { dur: '5.4s', begin: '0.6s', r: 3.2 },
  'fa-pathJ': { dur: '6.2s', begin: '1.4s', r: 3 },
  'fa-pathE': { dur: '5.6s', begin: '0s',   r: 3.2 },
  'fa-pathF': { dur: '6.8s', begin: '1s',   r: 3 },
  'fa-pathG': { dur: '6s',   begin: '0.5s', r: 3.2 },
  'fa-pathH': { dur: '5s',   begin: '1.8s', r: 2.8 },
  'fa-pathK': { dur: '5.9s', begin: '0.2s', r: 3.2 },
  'fa-pathL': { dur: '6.6s', begin: '1.1s', r: 3 },
};

// ---------------------------------------------------------------------------
// Escala conforme a janela
// ---------------------------------------------------------------------------
// - H / 1000: garante espaço vertical entre as linhas novas e a colmeia dos cantos;
// - W / 950:  garante que as linhas da esquerda e da direita não se cruzem;
// - mínimo 0.35 / máximo 1.25: nem minúsculo no celular, nem gigante em monitor grande.
function calcularEscala(w, h) {
  return Math.min(1.25, Math.max(0.35, Math.min(h / 1000, w / 950)));
}

// ---------------------------------------------------------------------------
// Colmeia tech (cantos inferior esquerdo e superior direito)
// ---------------------------------------------------------------------------
function pontosHexagono(cx, cy, r) {
  return Array.from({ length: 6 })
    .map((_, k) => {
      const ang = (Math.PI / 3) * k;
      return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
    })
    .join(' ');
}

// Gera os favos em pixels reais. O padrão é montado a partir do canto (u = distância da
// lateral, v = distância da borda) e depois posicionado: no canto inferior esquerdo
// (x = u, y = h - v) e, girado 180°, no canto superior direito (x = w - u, y = v).
function gerarFavos(w, h, k) {
  const raio = 46 * k;
  const altura = Math.sqrt(3) * raio;
  const zona = 250 * k;
  const passoX = 1.5 * raio;
  const favos = [];

  for (let col = -1; col * passoX <= zona + raio; col++) {
    const u = col * passoX;

    for (let row = -1; row * altura <= zona + altura; row++) {
      const v = row * altura + (col % 2 !== 0 ? altura / 2 : 0);
      const distancia = Math.hypot(u, v);
      if (distancia > zona) continue;

      const indice = favos.length;
      const base = {
        opacidade: Math.max(0.25, 1 - distancia / zona),
        atraso: ((distancia / k) * 0.0075 + ((indice * 37) % 10) / 30).toFixed(2),
        corredor: distancia < zona * 0.84 && (col * 7 + row * 3 + 100) % 5 === 0,
        atrasoCorredor: (((indice * 13) % 10) / 2).toFixed(1),
      };

      favos.push({ ...base, id: `bl_${col}_${row}`, pontos: pontosHexagono(u, h - v, raio) });
      favos.push({ ...base, id: `tr_${col}_${row}`, pontos: pontosHexagono(w - u, v, raio) });
    }
  }
  return favos;
}

// ---------------------------------------------------------------------------
// Partículas
// ---------------------------------------------------------------------------
function gerarParticulas(quantidade) {
  return Array.from({ length: quantidade }).map((_, i) => {
    const size = Math.random() * 2.2 + 1;
    return {
      id: i,
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      animationDuration: `calc(${(Math.random() * 3 + 2).toFixed(2)}s * var(--v-fundo, 1))`,
      animationDelay: `${(Math.random() * 4).toFixed(2)}s`,
    };
  });
}

// ---------------------------------------------------------------------------
// Tamanho da janela (atualiza ao redimensionar / girar o aparelho)
// ---------------------------------------------------------------------------
function useTamanhoTela() {
  const [tamanho, setTamanho] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  useEffect(() => {
    let quadro = 0;

    function atualizar() {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setTamanho((anterior) => (anterior.w === w && anterior.h === h ? anterior : { w, h }));
      });
    }

    window.addEventListener('resize', atualizar);
    window.addEventListener('orientationchange', atualizar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', atualizar);
      window.removeEventListener('orientationchange', atualizar);
    };
  }, []);

  return tamanho;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
function GrupoCircuitos({ trilhas, nos, styles: s }) {
  return (
    <>
      {trilhas.map((t) => (
        <path
          key={t.id}
          id={t.id}
          className={`${s['circuit-line']} ${t.bright ? s.bright : ''}`}
          d={t.d}
        />
      ))}

      {nos.map(([cx, cy, atraso]) => (
        <circle
          key={`${cx}-${cy}`}
          className={`${s.node} ${s.pulse}`}
          cx={cx}
          cy={cy}
          r="3"
          style={{ animationDelay: `${atraso}s` }}
        />
      ))}

      {trilhas.map((t) => {
        const p = PULSOS[t.id];
        return (
          <circle key={`pulso-${t.id}`} className={s.traveler} r={p.r} data-pulso>
            <animateMotion
              dur={p.dur}
              begin={p.begin}
              repeatCount="indefinite"
              calcMode="linear"
              keyPoints="0;1;0"
              keyTimes="0;0.5;1"
              {...(p.rotate ? { rotate: 'auto' } : {})}
            >
              <mpath href={`#${t.id}`} />
            </animateMotion>
          </circle>
        );
      })}
    </>
  );
}

function FundoAnimado({ particulas = 60 }) {
  const { w, h } = useTamanhoTela();
  const k = calcularEscala(w, h);

  // menos partículas em telas pequenas
  const [lista] = useState(() =>
    gerarParticulas(
      Math.min(particulas, Math.max(24, Math.round((window.innerWidth * window.innerHeight) / 12000)))
    )
  );

  const favos = useMemo(() => gerarFavos(w, h, k), [w, h, k]);

  // Linhas da esquerda: ancoradas no canto superior esquerdo.
  // Linhas da direita: ancoradas no canto inferior direito.
  const transformEsq = `scale(${k})`;
  const transformDir = `translate(${w} ${h}) scale(${k}) translate(${-PROJETO_W} ${-PROJETO_H})`;

  return (
    <div className={styles.stage} data-efeito="fundo" aria-hidden="true">
      <div className={styles.grid}></div>
      <div className={`${styles.hex} ${styles.bl}`}></div>
      <div className={`${styles.hex} ${styles.tr}`}></div>

      {/* Colmeia tech: favos pulsando em onda + luzes correndo pelas bordas */}
      <svg className={styles.honey} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
        {favos.map((f) => (
          <polygon
            key={f.id}
            className={styles.hexCell}
            points={f.pontos}
            style={{ opacity: f.opacidade, animationDelay: `${f.atraso}s` }}
          />
        ))}
        {favos
          .filter((f) => f.corredor)
          .map((f) => (
            <polygon
              key={`run-${f.id}`}
              className={styles.hexRunner}
              points={f.pontos}
              pathLength="100"
              style={{ opacity: f.opacidade, animationDelay: `${f.atrasoCorredor}s` }}
            />
          ))}
      </svg>

      <svg className={styles.circuits} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
        <g transform={transformEsq}>
          <GrupoCircuitos trilhas={TRILHAS_ESQ} nos={NOS_ESQ} styles={styles} />
        </g>
        <g transform={transformDir}>
          <GrupoCircuitos trilhas={TRILHAS_DIR} nos={NOS_DIR} styles={styles} />
        </g>
      </svg>

      <div className={styles.particlesContainer}>
        {lista.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default FundoAnimado;
