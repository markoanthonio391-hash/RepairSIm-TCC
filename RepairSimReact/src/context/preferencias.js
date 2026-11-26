export const TEMAS = ['Escuro', 'Claro'];
export const FONTES = ['Pequena', 'Padrão', 'Grande', 'Muito grande'];

const ATRIBUTO_TEMA = { Escuro: 'escuro', Claro: 'claro' };
const ATRIBUTO_FONTE = { Pequena: 'pequena', 'Padrão': 'padrao', Grande: 'grande', 'Muito grande': 'muito-grande' };

// ---------- Efeitos de animação ----------
export const NIVEIS = ['normal', 'reduzido', 'desligado'];
export const ROTULO_NIVEL = { normal: 'Normal', reduzido: 'Reduzido', desligado: 'Desligado' };

export const EFEITOS = [
  { chave: 'fundo',  rotulo: 'Fundo animado',     descricao: 'Grade, circuitos, colmeia e partículas' },
  { chave: 'titulo', rotulo: 'Título RepairSim',  descricao: 'Onda das letras, brilho, chave e engrenagem' },
  { chave: 'icones', rotulo: 'Ícones dos botões', descricao: 'Play, engrenagem, troféu, relógio...' },
  { chave: 'neon',   rotulo: 'Neon dos botões',   descricao: 'Piscar ao ligar e brilho das bordas' },
  { chave: 'logo',   rotulo: 'Logo TechSolve',    descricao: 'Linhas, pulsos e pontos de luz' },
];

// Sem escolha salva: segue o sistema (se pediu "reduzir movimento", começa em Reduzido)
function nivelPadrao() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduzido' : 'normal';
  } catch {
    return 'normal';
  }
}

export function lerEfeitos() {
  const padrao = nivelPadrao();
  let salvo = {};
  try {
    salvo = JSON.parse(localStorage.getItem('config_efeitos')) ?? {};
  } catch {
    salvo = {};
  }
  return Object.fromEntries(
    EFEITOS.map(({ chave }) => [chave, NIVEIS.includes(salvo?.[chave]) ? salvo[chave] : padrao])
  );
}

export function salvarEfeitos(efeitos) {
  salvarPreferencia('config_efeitos', JSON.stringify(efeitos));
}

// localStorage pode lançar erro (modo privado, cookies bloqueados): nesse caso usa o padrão
export function lerPreferencia(chave, validos, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return validos.includes(valor) ? valor : padrao;
  } catch {
    return padrao;
  }
}

export function salvarPreferencia(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // sem permissão para salvar: a escolha vale só até fechar a página
  }
}

export function aplicarAparencia(tema, fonte, efeitos) {
  const raiz = document.documentElement;
  raiz.dataset.tema = ATRIBUTO_TEMA[tema] ?? 'escuro';
  raiz.dataset.fonte = ATRIBUTO_FONTE[fonte] ?? 'padrao';
  if (efeitos) {
    // vira data-efeito-fundo, data-efeito-titulo, etc.
    for (const { chave } of EFEITOS) {
      raiz.setAttribute(`data-efeito-${chave}`, efeitos[chave] ?? 'normal');
    }
  }
}

export function proximoValor(lista, atual) {
  const indice = lista.indexOf(atual);
  return lista[(indice + 1) % lista.length];
}