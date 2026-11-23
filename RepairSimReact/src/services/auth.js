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

//junta campos novos ao usuário já salvo (ex.: papel e instituição depois de entrar numa instituição)
export function atualizarUsuario(campos) {
  const atual = lerUsuario();
  if (!atual) return;
  salvarUsuario({ ...atual, ...campos });
}

//true se o usuário logado é ADM de uma instituição.
//ATENÇÃO: isto só serve para mostrar ou esconder botões (o localStorage pode ser editado). Quem protege de verdade é o servidor (403).
export function ehAdmin() {
  return lerUsuario()?.papel === 'admin';
}

//true se o usuário tem e-mail institucional (aluno ou professor ADM): é quem vê "Casos exclusivos"
export function temInstituicao() {
  return Boolean(lerUsuario()?.papel);
}

//SESSÃO ÚNICA: se o servidor avisar que esta conta entrou em outro dispositivo, qualquer tela volta ao login com um aviso.
//Instalado uma vez no main.jsx: observa as respostas da API sem precisar mexer em cada fetch do projeto.
export function instalarAvisoSessaoSubstituida() {
  if (window.__avisoSessaoInstalado) return;
  window.__avisoSessaoInstalado = true;

  const fetchOriginal = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const resposta = await fetchOriginal(...args);

    if (resposta.status === 401) {
      try {
        const dados = await resposta.clone().json();

        if (dados?.codigo === 'SESSAO_SUBSTITUIDA') {
          limparSessao();
          sessionStorage.setItem('aviso_login', dados.mensagem);
          sessionStorage.removeItem('repairsim_jogatina'); //a partida em andamento foi interrompida no servidor
          window.location.assign('/login');
        }
      } catch {
        // resposta sem JSON: não é o aviso
      }
    }

    return resposta;
  };
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

    if (resposta.ok) {
      //atualiza papel e instituição (quem foi promovido a ADM ou entrou numa instituição vê o botão novo sem sair e entrar de novo)
      const dados = await resposta.json().catch(() => null);
      if (dados?.usuario) {
        atualizarUsuario({ papel: dados.usuario.papel ?? null });
      }
      return true;
    }

    return Boolean(lerUsuario());
  } catch {
    return Boolean(lerUsuario());
  }
}