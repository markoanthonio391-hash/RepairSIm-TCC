// funções de apoio para a sessão do jogador.
// o "login de verdade" fica num cookie httpOnly guardado pelo navegador (o JavaScript não enxerga).
// aqui no localStorage guardamos só dados básicos (id, nome e username) para o menu saber quem está logado.

export const API_URL = 'http://localhost:3000';

//devolve o usuário logado (ou null se ninguém estiver logado)
export function lerUsuario() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario && usuario.id_usuario ? usuario : null;
  } catch {
    return null;
  }
}

export function salvarUsuario(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem('usuario');
}

//sai da conta: o servidor apaga o cookie e o front apaga os dados locais
export async function sairDaConta() {
  try {
    await fetch(`${API_URL}/usuarios/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    // servidor fora do ar: limpa localmente mesmo assim
  }
  limparSessao();
}

//pergunta ao servidor se o login ainda é válido (o cookie dura 7 dias)
//devolve true/false. Se o servidor estiver fora do ar, mantém o estado local
export async function validarSessao() {
  try {
    const resposta = await fetch(`${API_URL}/usuarios/me`, { credentials: 'include' });
    if (resposta.status === 401) {
      limparSessao();
      return false;
    }
    return resposta.ok ? true : Boolean(lerUsuario());
  } catch {
    return Boolean(lerUsuario());
  }
}