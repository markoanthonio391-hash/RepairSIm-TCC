import styles from './Historico.module.css';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, lerUsuario, limparSessao } from '../../../services/auth';
import Estrelas from '../../../components/Estrelas';

function formatarData(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '-';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatarTempo(segundos) {
  const total = Number(segundos);
  if (!Number.isFinite(total)) return '-';
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// nomes com acento para mostrar na tela (no banco ficam sem acento)
const ROTULO_DIFICULDADE = { Facil: 'Fácil', Medio: 'Médio', Dificil: 'Difícil' };
const rotuloDificuldade = (d) => ROTULO_DIFICULDADE[d] ?? d;

function Historico() {
  const navigate = useNavigate();
  const usuario = useMemo(lerUsuario, []);

  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [particulas, setParticulas] = useState([]);

  // Sem conta logada: volta para o login
  useEffect(() => {
    if (!usuario) navigate('/login', { replace: true });
  }, [usuario, navigate]);

  // Busca as partidas do usuário logado
  useEffect(() => {
    if (!usuario) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_URL}/resultados/meus`, {
          credentials: 'include',
          signal: controller.signal,
        });
        // login expirado: limpa os dados locais e volta para a tela de login
        if (response.status === 401) {
          limparSessao();
          navigate('/login', { replace: true });
          return;
        }
        const data = await response.json();
        if (response.ok) {
          setPartidas(data.partidas || []);
        } else {
          setError(data.mensagem || 'Não foi possível carregar o histórico.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Não foi possível conectar ao servidor.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [usuario, navigate]);

  // Partículas de fundo (mesma fórmula das outras telas)
  useEffect(() => {
    const novas = Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 2.2 + 1;
      return {
        id: i,
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        animationDuration: `${(Math.random() * 3 + 2).toFixed(2)}s`,
        animationDelay: `${(Math.random() * 4).toFixed(2)}s`,
      };
    });
    setParticulas(novas);
  }, []);

  const dificuldades = useMemo(
    () => [...new Set(partidas.map((p) => p.dificuldade).filter(Boolean))],
    [partidas]
  );

  const visiveis = useMemo(
    () => (filtro === 'todas' ? partidas : partidas.filter((p) => p.dificuldade === filtro)),
    [partidas, filtro]
  );

  const resumo = useMemo(() => {
    if (visiveis.length === 0) return { total: 0, melhor: 0, media: 0 };
    const pontos = visiveis.map((p) => Number(p.pontuacao) || 0);
    const soma = pontos.reduce((a, b) => a + b, 0);
    return {
      total: visiveis.length,
      melhor: Math.max(...pontos),
      media: Math.round(soma / visiveis.length),
    };
  }, [visiveis]);

  if (!usuario) return null;

  return (
    <div className={styles.page}>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.grid}></div>
        <div className={`${styles.hex} ${styles.bl}`}></div>
        <div className={`${styles.hex} ${styles.tr}`}></div>

        <svg className={styles.circuits} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <path className={styles['circuit-line']} d="M -20,20 L 60,20 L 130,90 L 300,90 L 340,130" />
          <path className={`${styles['circuit-line']} ${styles.bright}`} d="M -20,110 L 40,110 L 100,170 L 260,170 L 300,210" />
          <path className={styles['circuit-line']} d="M -20,220 L 70,220 L 150,300 L 360,300 L 420,360" />
          <path className={`${styles['circuit-line']} ${styles.bright}`} d="M 1620,560 L 1500,560 L 1440,500 L 1300,500 L 1230,570 L 1130,570" />
          <path className={styles['circuit-line']} d="M 1620,660 L 1520,660 L 1460,600 L 1350,600 L 1300,650" />
          <path className={styles['circuit-line']} d="M 1620,780 L 1480,780 L 1420,720 L 1330,720 L 1280,770 L 1160,770" />

          <circle className={`${styles.node} ${styles.pulse}`} cx="130" cy="90" r="3" style={{ animationDelay: '0.4s' }} />
          <circle className={`${styles.node} ${styles.pulse}`} cx="260" cy="170" r="3" style={{ animationDelay: '0.3s' }} />
          <circle className={`${styles.node} ${styles.pulse}`} cx="360" cy="300" r="3" style={{ animationDelay: '1.4s' }} />
          <circle className={`${styles.node} ${styles.pulse}`} cx="1300" cy="500" r="3" style={{ animationDelay: '0.9s' }} />
          <circle className={`${styles.node} ${styles.pulse}`} cx="1350" cy="600" r="3" style={{ animationDelay: '0.5s' }} />
          <circle className={`${styles.node} ${styles.pulse}`} cx="1420" cy="720" r="3" style={{ animationDelay: '0.7s' }} />
        </svg>

        <div className={styles.particlesContainer}>
          {particulas.map((p) => (
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

      <main className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Histórico de partidas</h1>
            <p className={styles.subtitle}>Jogador: {usuario.username}</p>
          </div>
          <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
            Voltar ao menu
          </button>
        </header>

        {loading && <p className={styles.message}>Carregando partidas...</p>}

        {!loading && error && (
          <p className={`${styles.message} ${styles.error}`} role="alert">
            {error}
          </p>
        )}

        {!loading && !error && partidas.length === 0 && (
          <div className={styles.empty}>
            <p>Você ainda não jogou nenhuma partida.</p>
            <button type="button" className={styles.playButton} onClick={() => navigate('/dificuldade')}>
              Jogar agora
            </button>
          </div>
        )}

        {!loading && !error && partidas.length > 0 && (
          <>
            <dl className={styles.summary}>
              <div>
                <dt>Partidas</dt>
                <dd>{resumo.total}</dd>
              </div>
              <div>
                <dt>Melhor pontuação</dt>
                <dd className={styles.highlight}>{resumo.melhor}</dd>
              </div>
              <div>
                <dt>Média</dt>
                <dd>{resumo.media}</dd>
              </div>
            </dl>

            <div className={styles.toolbar}>
              <label htmlFor="filtro-dificuldade">Dificuldade</label>
              <select
                id="filtro-dificuldade"
                className={styles.select}
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todas">Todas</option>
                {dificuldades.map((d) => (
                  <option key={d} value={d}>
                    {rotuloDificuldade(d)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Dificuldade</th>
                    <th>Pontuação</th>
                    <th>Estrelas</th>
                    <th>Casos</th>
                    <th>Erros</th>
                    <th>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((p) => (
                    <tr key={p.id}>
                      <td>{formatarData(p.data_partida)}</td>
                      <td>{rotuloDificuldade(p.dificuldade)}</td>
                      <td className={Number(p.pontuacao) === resumo.melhor ? styles.highlight : ''}>
                        {p.pontuacao}
                      </td>
                      <td><Estrelas valor={p.estrelas} /></td>
                      <td>{p.casos}</td>
                      <td>{p.erros}</td>
                      <td>{formatarTempo(p.tempo_segundos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Historico;
