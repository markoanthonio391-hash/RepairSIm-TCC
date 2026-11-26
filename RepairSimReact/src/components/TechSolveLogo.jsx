import { useId } from "react";
import { useTheme } from "../context/useTheme"; // ajuste o caminho se necessário

const PALETTES = {
  dark: {
    bg: "#040b1f", cyan: "#22d3ee", blue: "#3b82f6", line: "#38bdf8",
    hexA: "#0d3a8f", hexB: "#050f2b", nodeFill: "#061230", coreOp: "0.55", dots: "0.8",
    travel: "#d6efff", halo: "#38bdf8", haloOp: 0.5,
  },
  light: {
    bg: "none", cyan: "#06b6d4", blue: "#2563eb", line: "#0ea5e9",
    hexA: "#e6f2ff", hexB: "#ffffff", nodeFill: "#ffffff", coreOp: "0", dots: "0.35",
    travel: "#1d4ed8", halo: "#2563eb", haloOp: 0.4,
  },
};

// Troque pelo e-mail de suporte quando ele existir (ex.: "suporte@techsolve.com").
// Enquanto estiver vazio, o logo não é clicável.
const EMAIL_SUPORTE = "";
const ASSUNTO_SUPORTE = "Suporte RepairSim";

// caminhos percorridos pelos pontos de luz
const HEX_INNER = "M256 55 L394.6 135 L394.6 295 L256 375 L117.4 295 L117.4 135 Z";
const HEX_OUTER_REV = "M256 43 L107 129 L107 301 L256 387 L405 301 L405 129 Z";
const BANNER = "M70 335 H442 L452 345 V385 L430 395 H300 L256 420 L212 395 H82 L60 385 V345 Z";
const TRACES = [
  "M394.6 135 H420 V160",
  "M394.6 295 H418 V270",
  "M117.4 135 H92 V165",
  "M117.4 295 H96 V265",
  "M256 55 L330 98",
];

const CSS = `
@keyframes tsl-march-a { to { stroke-dashoffset: -190; } }
@keyframes tsl-march-b { to { stroke-dashoffset: -244; } }
@keyframes tsl-pulse   { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes tsl-comet   { from { stroke-dashoffset: 70; } to { stroke-dashoffset: -930; } }
.tsl-march-a { animation: tsl-march-a calc(6s * var(--v-logo, 1)) linear infinite; }
.tsl-march-b { animation: tsl-march-b calc(8s * var(--v-logo, 1)) linear infinite reverse; }
.tsl-pulse   { animation: tsl-pulse calc(2.4s * var(--v-logo, 1)) ease-in-out infinite; }
.tsl-pulse-2 { animation: tsl-pulse calc(2.4s * var(--v-logo, 1)) ease-in-out infinite; animation-delay: -1.2s; }
.tsl-comet   { animation: tsl-comet calc(6s * var(--v-logo, 1)) linear infinite; }
.tsl-link { cursor: pointer; }
.tsl-link:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
// @media (prefers-reduced-motion: reduce) {
//   .tsl-march-a, .tsl-march-b, .tsl-pulse, .tsl-pulse-2, .tsl-comet { animation: none; }
//   .tsl-dot, .tsl-comet { display: none; }
// }
`;

/**
 * Logo TechSolve em SVG.
 * variant: "dark" | "light". Se omitido, segue o tema do app (Escuro/Claro) via useTheme.
 * withBackground: no modo "dark", desenha o fundo azul-marinho atrás do logo
 * animated: liga/desliga as animações (padrão: ligado)
 * linkSuporte: torna o logo um link de e-mail quando EMAIL_SUPORTE estiver preenchido
 */
export default function TechSolveLogo({
  variant,
  size = 256,
  withBackground = false,
  animated = true,
  linkSuporte = true,
  ...props
}) {
  const { tema } = useTheme() ?? {};
  const modo = variant ?? (String(tema).toLowerCase() === "claro" ? "light" : "dark");
  const uid = useId().replace(/:/g, "");
  const p = `ts-${uid}`;
  const c = { ...PALETTES[modo] };
  if (!withBackground) c.bg = "none";
  c.glow = modo === "dark" ? `url(#${p}-glow)` : "none";

  const href = linkSuporte && EMAIL_SUPORTE
    ? `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(ASSUNTO_SUPORTE)}`
    : undefined;

  // ponto de luz (com halo) que anda por um caminho
  const dot = (key, path, dur, begin = "0s", r = 4.5) => (
    <g key={key} className="tsl-dot">
      <circle r={r * 3} fill={c.halo} opacity={c.haloOp * 0.45} />
      <circle r={r * 1.8} fill={c.halo} opacity={c.haloOp} />
      <circle r={r} fill={c.travel} />
      <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={path} />
    </g>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 450"
      width={size}
      height={(size * 450) / 512}
      role={href ? undefined : "img"}
      aria-label={href ? undefined : "TechSolve"}
      data-efeito="logo"
      {...props}
    >
      {animated && <style>{CSS}</style>}
      <defs>
        <linearGradient id={`${p}-steel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc"/>
          <stop offset="0.55" stopColor="#cbd5e1"/>
          <stop offset="1" stopColor="#8fa3bd"/>
        </linearGradient>
        <linearGradient id={`${p}-hex`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.hexA}/>
          <stop offset="1" stopColor={c.hexB}/>
        </linearGradient>
        <radialGradient id={`${p}-core`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3b82f6" stopOpacity={c.coreOp}/>
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`${p}-tech`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#67e8f9"/>
          <stop offset="1" stopColor="#2563eb"/>
        </linearGradient>
        <linearGradient id={`${p}-solve`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff"/>
          <stop offset="1" stopColor="#9fb6d8"/>
        </linearGradient>
        <linearGradient id={`${p}-banner`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1f4d"/>
          <stop offset="1" stopColor="#040b1f"/>
        </linearGradient>
        <filter id={`${p}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <a
        href={href}
        className={href ? "tsl-link" : undefined}
        aria-label={href ? "Contatar o suporte TechSolve por e-mail" : undefined}
      >
        <rect width="512" height="450" fill={c.bg}/>
        <g filter={c.glow}>
          <polygon
            className={animated ? "tsl-march-a" : undefined}
            points="256,43 405,129 405,301 256,387 107,301 107,129"
            fill="none" stroke={c.blue} strokeWidth="1.5" strokeDasharray="40 10 90 10 30 10" opacity="0.8"
          />
          <polygon
            className={animated ? "tsl-march-b" : undefined}
            points="256,55 394.6,135 394.6,295 256,375 117.4,295 117.4,135"
            fill="none" stroke={c.line} strokeWidth="2.5" strokeDasharray="150 12 70 12"
          />
          <path
            className={animated ? "tsl-pulse" : undefined}
            d="M394.6 135 H420 V160 M394.6 295 H418 V270 M117.4 135 H92 V165 M117.4 295 H96 V265 M256 55 L330 98"
            fill="none" stroke={c.line} strokeWidth="2"
          />
        </g>
        <polygon points="256,80 373,147.5 373,282.5 256,350 139,282.5 139,147.5" fill={`url(#${p}-hex)`} stroke={c.line} strokeWidth="3" filter={c.glow}/>
        <polygon points="256,80 373,147.5 373,282.5 256,350 139,282.5 139,147.5" fill={`url(#${p}-core)`}/>
        <polygon
          className={animated ? "tsl-pulse-2" : undefined}
          points="256,91 363.4,153 363.4,277 256,339 148.6,277 148.6,153"
          fill="none" stroke={c.blue} strokeWidth="1.5" opacity="0.7"
        />
        <g fill={c.cyan} opacity={c.dots}>
          <circle cx="175" cy="215" r="1.8"/><circle cx="200" cy="300" r="1.5"/><circle cx="330" cy="310" r="1.8"/>
          <circle cx="345" cy="190" r="1.5"/><circle cx="290" cy="120" r="1.8"/><circle cx="160" cy="170" r="1.5"/>
        </g>
        <g fill={c.nodeFill} stroke={c.cyan} strokeWidth="2.5">
          <circle cx="420" cy="160" r="6"/><circle cx="418" cy="270" r="6"/><circle cx="92" cy="165" r="6"/>
          <circle cx="96" cy="265" r="6"/><circle cx="394.6" cy="135" r="6"/><circle cx="117.4" cy="295" r="6"/>
          <circle cx="330" cy="98" r="6"/><circle cx="256" cy="43" r="6"/>
        </g>
        <g transform="translate(256 200) rotate(-45) scale(0.9) translate(0 -25)" strokeLinejoin="round">
          <path d="M-16 -99 L-16 -58 A16 16 0 0 0 16 -58 L16 -99 A44 44 0 0 1 13 -16 L13 100 A28 28 0 1 1 -13 100 L-13 -16 A44 44 0 0 1 -16 -99 Z M-11 125 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z" fill="#0b1b3d" stroke="#0b1b3d" strokeWidth="5" fillRule="evenodd" transform="translate(5 6)"/>
          <path d="M-16 -99 L-16 -58 A16 16 0 0 0 16 -58 L16 -99 A44 44 0 0 1 13 -16 L13 100 A28 28 0 1 1 -13 100 L-13 -16 A44 44 0 0 1 -16 -99 Z M-11 125 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z" fill={`url(#${p}-steel)`} stroke="#0b1b3d" strokeWidth="5" fillRule="evenodd"/>
          <rect x="-4" y="-5" width="8" height="95" rx="4" fill="#ffffff" opacity="0.75"/>
        </g>
        <path d="M70 335 H442 L452 345 V385 L430 395 H300 L256 420 L212 395 H82 L60 385 V345 Z" fill={`url(#${p}-banner)`} stroke={c.line} strokeWidth="3" strokeLinejoin="round" filter={c.glow}/>
        <path d="M82 389 H212 M300 389 H430" fill="none" stroke={c.blue} strokeWidth="1.5" opacity="0.8"/>
        <circle cx="256" cy="407" r="5" fill={c.nodeFill} stroke={c.cyan} strokeWidth="2.5"/>
        <text x="256" y="383" textAnchor="middle" fontFamily="Orbitron, Eurostile, 'Arial Black', Impact, sans-serif" fontSize="54" fontWeight="900" fontStyle="italic" textLength="340" lengthAdjust="spacingAndGlyphs"><tspan fill={`url(#${p}-tech)`}>TECH</tspan><tspan fill={`url(#${p}-solve)`}>SOLVE</tspan></text>

        {animated && (
          <>
            <path
              className="tsl-comet"
              d={HEX_INNER}
              pathLength="1000"
              fill="none"
              stroke={c.travel}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="70 930"
              opacity="0.9"
            />
            {dot("hex-inner", HEX_INNER, "6s", "0s", 5)}
            {dot("hex-outer", HEX_OUTER_REV, "9s", "-3s", 4)}
            {dot("banner", BANNER, "7s", "0s", 4)}
            {TRACES.map((d, i) => dot(`trace-${i}`, d, "2.4s", `${i * 0.5}s`, 3.5))}
          </>
        )}
      </a>
    </svg>
  );
}

export const TechSolveLogoDark = (props) => <TechSolveLogo variant="dark" {...props} />;
export const TechSolveLogoLight = (props) => <TechSolveLogo variant="light" {...props} />;