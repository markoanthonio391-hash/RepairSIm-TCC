// Preferências de aparência (tema e tamanho da fonte). Fica fora do ThemeProvider.jsx para o
// Fast Refresh do Vite continuar funcionando (arquivo .jsx só pode exportar componentes).

export const TEMAS = ['Escuro', 'Claro'];
export const FONTES = ['Pequena', 'Padrão', 'Grande', 'Muito grande'];

// valor guardado -> valor usado nos atributos do <html> (data-tema / data-fonte).
// ATENÇÃO: o script do index.html repete este mapa para aplicar o tema antes da tela aparecer.
// Se mudar aqui, mude lá também (há um teste que compara os dois).
const ATRIBUTO_TEMA = { Escuro: 'escuro', Claro: 'claro' };
const ATRIBUTO_FONTE = { Pequena: 'pequena', 'Padrão': 'padrao', Grande: 'grande', 'Muito grande': 'muito-grande' };

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

export function aplicarAparencia(tema, fonte) {
  const raiz = document.documentElement;
  raiz.dataset.tema = ATRIBUTO_TEMA[tema] ?? 'escuro';
  raiz.dataset.fonte = ATRIBUTO_FONTE[fonte] ?? 'padrao';
}

export function proximoValor(lista, atual) {
  const indice = lista.indexOf(atual);
  return lista[(indice + 1) % lista.length];
}
