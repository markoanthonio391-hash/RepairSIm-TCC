import { useEffect, useState } from 'react';
import { API_URL, atualizarUsuario, lerUsuario } from '../services/auth';

// Bloco da tela de Configurações sobre a instituição do jogador:
//  - logado e SEM instituição: campo para digitar o código de convite que o ADM repassou
//  - ADM: mostra o nome da instituição e o código de convite para copiar e passar aos alunos
//  - aluno: mostra o nome da instituição
// Visitantes (sem login) não veem nada.
function EntrarInstituicao() {
  const [usuario, setUsuario] = useState(() => lerUsuario());
  const [codigo, setCodigo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [codigoConvite, setCodigoConvite] = useState('');

  // para o ADM: busca o código de convite (GET /instituicoes/minha só devolve o código para ADM)
  const ehAdminLocal = usuario?.papel === 'admin';
  useEffect(() => {
    if (!ehAdminLocal) return;

    let cancelado = false;

    fetch(`${API_URL}/instituicoes/minha`, { credentials: 'include' })
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((dados) => {
        if (!cancelado && dados?.instituicao?.codigo_convite) {
          setCodigoConvite(dados.instituicao.codigo_convite);
        }
      })
      .catch(() => {
        // sem o código na tela; o resto continua funcionando
      });

    return () => {
      cancelado = true;
    };
  }, [ehAdminLocal]);

  if (!usuario) {
    return null;
  }

  async function entrar(e) {
    e.preventDefault();

    if (enviando) return; // evita enviar duas vezes

    setEnviando(true);
    setErro('');
    setMensagem('');

    try {
      const resposta = await fetch(`${API_URL}/instituicoes/entrar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim() })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        // 404 código inválido, 409 já faz parte de uma instituição, 429 muitas tentativas: a API manda a mensagem pronta
        setErro(dados.mensagem || 'Não foi possível entrar na instituição.');
        return;
      }

      atualizarUsuario({ papel: dados.papel, instituicao: dados.instituicao });
      setUsuario(lerUsuario());
      setMensagem(dados.mensagem || 'Você entrou na instituição!');
      setCodigo('');
    } catch (erroRede) {
      console.error('Erro ao entrar na instituição:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setEnviando(false);
    }
  }

  const estilo = { position: 'relative', zIndex: 5, color: 'white', textAlign: 'center', margin: '12px 16px', fontFamily: 'Unispace, monospace' };

  // já tem instituição
  if (usuario.instituicao) {
    return (
      <div style={estilo}>
        <p>Instituição: <strong>{usuario.instituicao.nome}</strong> ({usuario.papel === 'admin' ? 'ADM' : 'aluno'})</p>
        {ehAdminLocal && codigoConvite && (
          <p>
            Código de convite para os alunos: <strong>{codigoConvite}</strong>{' '}
            <button type="button" onClick={() => navigator.clipboard?.writeText(codigoConvite)}>Copiar</button>
          </p>
        )}
        {mensagem && <p role="status">{mensagem}</p>}
      </div>
    );
  }

  // sem instituição: campo do código de convite
  return (
    <form onSubmit={entrar} style={estilo}>
      <label htmlFor="codigo-instituicao">Código da instituição</label>{' '}
      <input
        id="codigo-instituicao"
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código do seu professor"
        autoComplete="off"
        maxLength={20}
      />{' '}
      <button type="submit" disabled={enviando || codigo.trim().length === 0}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>
      {erro && <p role="alert" style={{ color: '#ff8a8a' }}>{erro}</p>}
      {mensagem && <p role="status">{mensagem}</p>}
    </form>
  );
}

export default EntrarInstituicao;
