import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './ResultadosProfessor.module.css';
import Estrelas from '../../components/Estrelas';
import { API_URL, ehAdmin, limparSessao } from '../../services/auth';

// Tela do PROFESSOR: resultados dos alunos por sala (cada código gerado é uma sala).
// ATENÇÃO: ehAdmin() só esconde a tela. Quem protege de verdade é o servidor (403 para quem não é professor ADM
// e só devolve salas e partidas do próprio professor).

const ROTULO_STATUS = { em_andamento: 'Em andamento', finalizada: 'Finalizada', interrompida: 'Interrompida' };

const ROTULO_MOTIVO = {
  saiu_da_sala: 'Saiu da sala',
  trocou_de_sala: 'Entrou em outra sala',
  nova_partida: 'Começou outra partida',
  sessao_substituida: 'Conta aberta em outro dispositivo',
  tempo: 'Passou de 2 horas'
};

const ATUALIZAR_A_CADA_MS = 20000;

function formatarDuracao(segundos) {
  const total = Math.max(0, Number(segundos) || 0);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

// evita "injeção de fórmula" no Excel: nomes digitados pelos alunos que começam com = + - @ ganham um apóstrofo
function celulaCsv(valor) {
  let texto = String(valor ?? '');
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return `"${texto.replace(/"/g, '""')}"`;
}

function ResultadosProfessor() {
  const navigate = useNavigate();
  const admin = ehAdmin();

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState('');
  const [partidas, setPartidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);            // aumenta a cada "atualizar" (manual ou automático)
  const [abertas, setAbertas] = useState({});         // { id_partida: { carregando, casos, erro } }

  // volta ao login ou à Home conforme o motivo
  function tratarAcesso(resposta) {
    if (resposta.status === 401) {
      limparSessao();
      navigate('/login');
      return true;
    }
    if (resposta.status === 403) {
      navigate('/');
      return true;
    }
    return false;
  }

  // lista de salas (códigos gerados): quando abre a tela e a cada atualização
  useEffect(() => {
    if (!admin) return;

    let cancelado = false;

    fetch(`${API_URL}/professor/salas`, { credentials: 'include' })
      .then(async (resposta) => {
        if (tratarAcesso(resposta)) return null;
        if (!resposta.ok) throw new Error('Erro ao buscar as salas.');
        return resposta.json();
      })
      .then((dados) => {
        if (cancelado || !dados) return;
        setSalas(dados.salas);
        // seleciona a sala mais recente na primeira vez
        setSalaId((atual) => atual || (dados.salas[0] ? String(dados.salas[0].id_sala) : ''));
        setCarregando(false);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelado) {
          setErro('Não foi possível carregar as salas.');
          setCarregando(false);
        }
      });

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, versao]);

  // partidas da sala escolhida
  useEffect(() => {
    if (!admin || !salaId) return;

    let cancelado = false;

    fetch(`${API_URL}/professor/salas/${salaId}/partidas`, { credentials: 'include' })
      .then(async (resposta) => {
        if (tratarAcesso(resposta)) return null;
        if (!resposta.ok) throw new Error('Erro ao buscar as partidas.');
        return resposta.json();
      })
      .then((dados) => {
        if (cancelado || !dados) return;
        setPartidas(dados.partidas);
        setErro('');
      })
      .catch((e) => {
        console.error(e);
        if (!cancelado) setErro('Não foi possível carregar as partidas desta sala.');
      });

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, salaId, versao]);

  // atualiza sozinho a cada 20 s (útil durante a prova, para ver quem está em andamento)
  useEffect(() => {
    if (!admin) return;
    const timer = setInterval(() => {
      if (!document.hidden) setVersao((v) => v + 1);
    }, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(timer);
  }, [admin]);

  const resumo = useMemo(() => {
    const alunos = new Set(partidas.map((p) => p.id_usuario)).size;
    const finalizadas = partidas.filter((p) => p.status === 'finalizada');
    const interrompidas = partidas.filter((p) => p.status === 'interrompida').length;
    const comNota = finalizadas.filter((p) => p.estrelas !== null && p.estrelas !== undefined);
    const media = comNota.length > 0
      ? (comNota.reduce((soma, p) => soma + Number(p.estrelas), 0) / comNota.length).toFixed(1)
      : '—';

    return { alunos, finalizadas: finalizadas.length, interrompidas, media };
  }, [partidas]);

  async function alternarDetalhe(partida) {
    const id = partida.id_partida;

    if (abertas[id]) {
      setAbertas((atual) => { const novo = { ...atual }; delete novo[id]; return novo; });
      return;
    }

    setAbertas((atual) => ({ ...atual, [id]: { carregando: true, casos: [], erro: '' } }));

    try {
      const resposta = await fetch(`${API_URL}/professor/partidas/${id}`, { credentials: 'include' });
      if (tratarAcesso(resposta)) return;
      if (!resposta.ok) throw new Error('Erro ao buscar o detalhe.');
      const dados = await resposta.json();
      setAbertas((atual) => ({ ...atual, [id]: { carregando: false, casos: dados.casos, erro: '' } }));
    } catch (e) {
      console.error(e);
      setAbertas((atual) => ({ ...atual, [id]: { carregando: false, casos: [], erro: 'Não foi possível carregar o detalhe.' } }));
    }
  }

  function baixarCsv() {
    const cabecalho = ['Aluno', 'Usuário', 'Tentativa', 'Status', 'Motivo', 'Início', 'Duração', 'Casos concluídos', 'Casos sorteados', 'Erros nos casos', 'Erros nos relatórios', 'Pontos', 'Estrelas'];
    const linhas = partidas.map((p) => [
      p.nome, p.username, p.tentativa, ROTULO_STATUS[p.status] ?? p.status, ROTULO_MOTIVO[p.motivo_interrupcao] ?? '',
      p.iniciada_em, formatarDuracao(p.duracao_segundos), p.casos_concluidos, p.casos_total,
      p.erros, p.erros_relatorio, p.pontos, p.estrelas ?? ''
    ]);

    const texto = [cabecalho, ...linhas].map((linha) => linha.map(celulaCsv).join(';')).join('\r\n');
    const arquivo = new Blob(['\ufeff' + texto], { type: 'text/csv;charset=utf-8' }); // \ufeff = o Excel lê os acentos certo
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-sala-${salaId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  const salaEscolhida = salas.find((s) => String(s.id_sala) === salaId);

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <h1 className={styles.titulo}>RESULTADOS DOS ALUNOS</h1>

        <div className={styles.barra}>
          <button type="button" className={`${styles.botao} ${styles.botaoVoltar}`} onClick={() => navigate('/')}>VOLTAR</button>

          <label htmlFor="sala">Sala (código gerado)</label>
          <select id="sala" value={salaId} onChange={(e) => setSalaId(e.target.value)} disabled={salas.length === 0}>
            {salas.length === 0 && <option value="">Nenhuma sala ainda</option>}
            {salas.map((s) => (
              <option key={s.id_sala} value={s.id_sala}>
                {s.criada_em} · código {s.codigo} · {s.alunos} aluno(s){s.ativa ? ' · ATIVA' : ''}
              </option>
            ))}
          </select>

          <button type="button" className={styles.botao} onClick={() => setVersao((v) => v + 1)}>ATUALIZAR</button>
          <button type="button" className={styles.botao} onClick={baixarCsv} disabled={partidas.length === 0}>BAIXAR CSV</button>
        </div>

        <p className={styles.ajuda}>
          A tela se atualiza sozinha a cada 20 segundos. Estrelas: erros por caso concluído (regras na tabela regra_estrelas).
          Partida interrompida não recebe nota, mas mostra os pontos feitos até ali.
        </p>

        {erro && <p className={styles.erro} role="alert">{erro}</p>}
        {carregando && <p>Carregando...</p>}
        {!carregando && salas.length === 0 && <p>Você ainda não gerou nenhum código. Gere um em "Cadastrar desafio".</p>}

        {salaEscolhida && (
          <>
            <div className={styles.resumo}>
              <div className={styles.cartao}>Alunos<strong>{resumo.alunos}</strong></div>
              <div className={styles.cartao}>Finalizadas<strong>{resumo.finalizadas}</strong></div>
              <div className={styles.cartao}>Interrompidas<strong>{resumo.interrompidas}</strong></div>
              <div className={styles.cartao}>Média de estrelas<strong>{resumo.media}</strong></div>
            </div>

            {partidas.length === 0 ? (
              <p>Nenhum aluno iniciou uma partida nesta sala ainda.</p>
            ) : (
              <div className={styles.tabelaBox}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Status</th>
                      <th>Início</th>
                      <th>Duração</th>
                      <th>Casos</th>
                      <th>Erros</th>
                      <th>Erros relat.</th>
                      <th>Pontos</th>
                      <th>Estrelas</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidas.map((p) => {
                      const detalhe = abertas[p.id_partida];

                      return (
                        <FragmentoPartida key={p.id_partida}>
                          <tr className={p.status === 'interrompida' ? styles.interrompida : ''}>
                            <td>
                              {p.nome}
                              <small> @{p.username}</small>
                              {p.tentativa > 1 && <span className={styles.etiqueta}>{p.tentativa}ª tentativa</span>}
                            </td>
                            <td>
                              {ROTULO_STATUS[p.status] ?? p.status}
                              {p.status === 'interrompida' && <span className={styles.etiqueta}>{ROTULO_MOTIVO[p.motivo_interrupcao] ?? 'Interrompida'}</span>}
                              {p.status === 'em_andamento' && <span className={`${styles.etiqueta} ${styles.etiquetaAndamento}`}>agora</span>}
                              {p.status === 'finalizada' && <span className={`${styles.etiqueta} ${styles.etiquetaOk}`}>ok</span>}
                            </td>
                            <td>{p.iniciada_em}</td>
                            <td>{formatarDuracao(p.duracao_segundos)}</td>
                            <td>{p.casos_concluidos}/{p.casos_total}</td>
                            <td>{p.erros}</td>
                            <td>{p.erros_relatorio}</td>
                            <td>{p.pontos}</td>
                            <td><Estrelas valor={p.estrelas} /></td>
                            <td>
                              <button type="button" className={styles.linkBotao} onClick={() => alternarDetalhe(p)}>
                                {detalhe ? 'fechar' : 'ver casos'}
                              </button>
                            </td>
                          </tr>

                          {detalhe && (
                            <tr className={styles.detalhe}>
                              <td colSpan={10}>
                                {detalhe.carregando && 'Carregando...'}
                                {detalhe.erro && <span className={styles.erro}>{detalhe.erro}</span>}
                                {!detalhe.carregando && !detalhe.erro && (
                                  <ul>
                                    {detalhe.casos.map((c) => (
                                      <li key={c.ordem}>
                                        {c.ordem}. {c.titulo}: {c.concluido ? 'concluído' : 'não concluído'} · {c.erros} erro(s) · {c.pontos} pontos ·
                                        relatório: {c.relatorio_correto === null ? 'não feito' : c.relatorio_correto ? 'correto' : `incorreto (${c.erros_relatorio} item(ns) errado(s))`}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                            </tr>
                          )}
                        </FragmentoPartida>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// agrupa duas linhas da tabela (a da partida e a do detalhe) sem criar um elemento extra no HTML
function FragmentoPartida({ children }) {
  return <>{children}</>;
}

export default ResultadosProfessor;
