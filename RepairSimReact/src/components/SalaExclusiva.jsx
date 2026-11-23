import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, ehAdmin, limparSessao } from '../services/auth';

// Janela "Casos exclusivos" (abre na tela de Dificuldade).
//  - ALUNO sem sala: digita o código de 6 números que o professor mostrou na aula.
//  - ALUNO com sala: vê o professor e quanto tempo o código ainda vale; pode INICIAR a partida ou SAIR DA SALA
//    (útil se digitou o código errado). O código só vale para COMEÇAR: quem já iniciou termina normalmente.
//  - PROFESSOR: não usa código. Joga os próprios casos para testar (nada é salvo).
// Props: onIniciar(dados) recebe a resposta do servidor ({ desafios, id_partida, teste }); onFechar() fecha a janela.
function SalaExclusiva({ onIniciar, onFechar }) {
  const navigate = useNavigate();
  const professor = ehAdmin();

  const [carregando, setCarregando] = useState(!professor);
  const [sala, setSala] = useState(null);           // { nome_professor, segundos_restantes }
  const [fimMs, setFimMs] = useState(0);             // momento (performance.now) em que o código expira
  const [agora, setAgora] = useState(() => performance.now());
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [trabalhando, setTrabalhando] = useState(false);

  // aluno: descobre se já está numa sala com código válido
  useEffect(() => {
    if (professor) return;

    let cancelado = false;

    fetch(`${API_URL}/salas/minha`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Erro ao buscar a sala.'))))
      .then((dados) => {
        if (cancelado) return;
        if (dados.sala) {
          setSala(dados.sala);
          setFimMs(performance.now() + dados.sala.segundos_restantes * 1000);
          setAgora(performance.now());
        }
      })
      .catch((e) => {
        console.error(e);
        if (!cancelado) setErro('Não foi possível consultar a sala.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => { cancelado = true; };
  }, [professor]);

  // contagem regressiva (relógio do servidor no início + contagem local; não depende da hora do computador)
  useEffect(() => {
    if (!sala) return;
    const timer = setInterval(() => setAgora(performance.now()), 1000);
    return () => clearInterval(timer);
  }, [sala]);

  const restante = sala ? Math.max(0, Math.ceil((fimMs - agora) / 1000)) : 0;
  const minutos = String(Math.floor(restante / 60)).padStart(2, '0');
  const segundos = String(restante % 60).padStart(2, '0');
  const codigoExpirou = Boolean(sala) && restante === 0;

  // trata 401 (sessão expirou) fora do caso da sessão única, que o aviso global já cuida
  function tratar401(resposta) {
    if (resposta.status === 401) {
      limparSessao();
      navigate('/login');
      return true;
    }
    return false;
  }

  async function entrar(e) {
    e.preventDefault();
    if (trabalhando) return;

    setTrabalhando(true);
    setErro('');

    try {
      const resposta = await fetch(`${API_URL}/salas/entrar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim() })
      });

      if (tratar401(resposta)) return;

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        // 400 formato, 404 código inválido/expirado, 429 muitas tentativas: a mensagem já vem pronta
        setErro(dados.mensagem || 'Não foi possível entrar na sala.');
        return;
      }

      setSala(dados.sala);
      setFimMs(performance.now() + dados.sala.segundos_restantes * 1000);
      setAgora(performance.now());
      setCodigo('');
    } catch (erroRede) {
      console.error('Erro ao entrar na sala:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setTrabalhando(false);
    }
  }

  async function sair() {
    if (trabalhando) return;

    setTrabalhando(true);
    setErro('');

    try {
      const resposta = await fetch(`${API_URL}/salas/minha`, { method: 'DELETE', credentials: 'include' });

      if (tratar401(resposta)) return;

      if (!resposta.ok) {
        setErro('Não foi possível sair da sala.');
        return;
      }

      setSala(null);
    } catch (erroRede) {
      console.error('Erro ao sair da sala:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setTrabalhando(false);
    }
  }

  async function iniciar() {
    if (trabalhando) return;

    setTrabalhando(true);
    setErro('');

    try {
      const resposta = await fetch(`${API_URL}/desafios-exclusivos/jogar`, { method: 'POST', credentials: 'include' });

      if (tratar401(resposta)) return;

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        // 403 (sem sala ou código expirado) e 404 (professor sem casos ativos): mensagem pronta da API
        setErro(dados.mensagem || 'Não foi possível carregar os casos exclusivos.');
        return;
      }

      onIniciar(dados);
    } catch (erroRede) {
      console.error('Erro ao iniciar casos exclusivos:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setTrabalhando(false);
    }
  }

  const fundo = {
    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.7)', padding: 16
  };
  const cartao = {
    background: 'rgb(1, 0, 44)', color: '#fff', border: '2px solid #a78bfa', borderRadius: 12,
    padding: 24, maxWidth: 420, width: '100%', fontFamily: 'Unispace, monospace', textAlign: 'center'
  };
  const botao = {
    fontFamily: 'inherit', fontSize: '1rem', padding: '10px 16px', margin: 6, borderRadius: 8,
    border: '2px solid #a78bfa', background: '#5b3fa0', color: '#fff', cursor: 'pointer'
  };

  return (
    <div style={fundo} role="presentation">
      <section style={cartao} role="dialog" aria-modal="true" aria-labelledby="titulo-sala">
        <h2 id="titulo-sala">CASOS EXCLUSIVOS</h2>

        {professor ? (
          <>
            <p>Modo professor: você joga os seus próprios casos para testar. Esta partida não é salva e não precisa de código.</p>
            <button type="button" style={botao} onClick={iniciar} disabled={trabalhando}>
              {trabalhando ? 'CARREGANDO...' : 'INICIAR TESTE'}
            </button>
          </>
        ) : carregando ? (
          <p>Carregando...</p>
        ) : sala ? (
          <>
            <p>Sala do professor <strong>{sala.nome_professor}</strong></p>
            <p>
              {codigoExpirou
                ? 'O código expirou. Você não pode começar uma nova partida (peça outro código ao professor).'
                : `O código vale por mais ${minutos}:${segundos} para começar uma partida.`}
            </p>
            <button type="button" style={botao} onClick={iniciar} disabled={trabalhando || codigoExpirou}>
              {trabalhando ? 'CARREGANDO...' : 'INICIAR PARTIDA'}
            </button>
            <button type="button" style={{ ...botao, background: '#3a4a5c', borderColor: '#7dd3fc' }} onClick={sair} disabled={trabalhando}>
              SAIR DA SALA
            </button>
          </>
        ) : (
          <form onSubmit={entrar}>
            <p>Digite o código de 6 números que o seu professor mostrou.</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              aria-label="Código da sala"
              style={{ fontFamily: 'inherit', fontSize: '1.6rem', letterSpacing: 6, textAlign: 'center', width: '9ch', padding: 8 }}
            />
            <div>
              <button type="submit" style={botao} disabled={trabalhando || codigo.length !== 6}>
                {trabalhando ? 'ENTRANDO...' : 'ENTRAR NA SALA'}
              </button>
            </div>
          </form>
        )}

        {erro && <p role="alert" style={{ color: '#ff8a8a' }}>{erro}</p>}

        <button type="button" style={{ ...botao, background: 'transparent' }} onClick={onFechar}>
          FECHAR
        </button>
      </section>
    </div>
  );
}

export default SalaExclusiva;
