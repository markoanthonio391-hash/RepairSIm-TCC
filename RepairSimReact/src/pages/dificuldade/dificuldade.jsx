import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dificuldade.module.css';
import TechSolveLogo from '../../components/TechSolveLogo';
import FundoAnimado from '../../components/FundoAnimado';
import { IconeFacil, IconeNormal, IconeDificil, IconeVoltar } from '../../components/IconesDificuldade';
import { useJogo } from '../../context/JogoContext';
import { useTheme } from '../../context/useTheme';
import { temInstituicao } from '../../services/auth';
import SalaExclusiva from '../../components/SalaExclusiva';
import { usePausarMusica } from '../../audio/musicaControle';

// "chave" é o valor que o backend espera na rota /desafios/dificuldade/:dificuldade/aleatorios
const NIVEIS = [
  {
    chave: 'Facil',
    rotulo: 'Fácil',
    classe: 'facil',
    Icone: IconeFacil,
    descricao: 'Defeitos comuns com sintomas diretos. Ideal para quem está começando a diagnosticar.',
  },
  {
    chave: 'Medio',
    rotulo: 'Normal',
    classe: 'normal',
    Icone: IconeNormal,
    descricao: 'Defeitos com 2 etapas para a resolução. Exige atenção aos sintomas e raciocínio.',
  },
  {
    chave: 'Dificil',
    rotulo: 'Difícil',
    classe: 'dificil',
    Icone: IconeDificil,
    descricao: 'Defeitos com 3 etapas para a resolução. Desafio para quem já domina a bancada.',
  },
];

function Dificuldade() {
  const navigate = useNavigate();
  const { iniciarJogatina } = useJogo();
  const { efeitos } = useTheme();

  const [mostrarVideos, setMostrarVideos] = useState(false);
  const [erro, setErro] = useState('');
  const [iniciando, setIniciando] = useState(false);
  const [salaAberta, setSalaAberta] = useState(false);

  // mesmo efeito "neon ligando" da Home: pisca por 4,5s e depois fica aceso
  const [ligando, setLigando] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLigando(false), 4500);
    return () => clearTimeout(timer);
  }, []);
  const faseClasse = ligando && efeitos.neon === 'normal' ? styles.ligando : styles.ligado;

  // o vídeo de entrada tem som próprio: a música do lobby pausa enquanto ele toca
  usePausarMusica(mostrarVideos);

  // Casos exclusivos: a janela SalaExclusiva cuida do código da sala e chama o servidor.
  function iniciarExclusivos(dados) {
    iniciarJogatina('Facil', dados.desafios, { idPartida: dados.id_partida ?? null, teste: Boolean(dados.teste) });
    setSalaAberta(false);
    setMostrarVideos(true);
  }

  async function iniciar(dificuldade) {
    if (iniciando) return;

    setIniciando(true);
    setErro('');

    try {
      const resposta = await fetch(`http://localhost:3000/desafios/dificuldade/${dificuldade}/aleatorios`);

      // 404 = nenhum caso válido nesta dificuldade (ver regra de etapas no backend)
      if (resposta.status === 404) {
        setErro('Ainda não há casos disponíveis para esta dificuldade. Escolha outra.');
        return;
      }

      if (!resposta.ok) {
        throw new Error('Erro ao montar a jogatina.');
      }

      const dados = await resposta.json();
      iniciarJogatina(dificuldade, dados.desafios);
      setMostrarVideos(true);
    } catch (erroIniciar) {
      console.error('Erro ao iniciar jogatina:', erroIniciar);
      setErro('Não foi possível iniciar a partida. Verifique a conexão com o servidor e tente de novo.');
    } finally {
      setIniciando(false);
    }
  }

  if (mostrarVideos) {
    return (
      <div className={styles.videoOverlay}>
        <video
          src="/videos/videoentrando.mp4"
          className={styles.video}
          autoPlay
          playsInline
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onEnded={() => navigate('/cliente')}
        />
        <button className={styles.continuarButton} onClick={() => navigate('/cliente')}>
          Pular
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container} data-efeito="menu">
      <FundoAnimado />

      {/* o botão inteiro é a seta de voltar */}
      <button
        type="button"
        data-som="back"
        aria-label="Voltar"
        title="Voltar"
        className={`${styles.voltarSeta} ${faseClasse}`}
        onClick={() => navigate('/')}
      >
        <span className={styles.setaWrap}><IconeVoltar /></span>
      </button>

      <TechSolveLogo size={130} className={styles.logo} />
      <h1 className={styles.title}>DIFICULDADES</h1>
      <h2 className={styles.subtitle}>Selecione uma dificuldade</h2>

      {erro && (
        <p role="alert" className={styles.erro}>
          {erro}
        </p>
      )}

      {/* modal temático com os botões lado a lado e a descrição abaixo de cada um */}
      <section className={styles.modal} aria-labelledby="titulo-modal-dificuldade">
        <header className={styles.modalTopo}>
          <span className={styles.led} aria-hidden="true" />
          <span id="titulo-modal-dificuldade" className={styles.modalTitulo}>Escolha seu nível</span>
        </header>

        <div className={styles.opcoes}>
          {NIVEIS.map(({ chave, rotulo, classe, Icone, descricao }) => (
            <div key={chave} className={`${styles.opcao} ${styles[classe]}`}>
              <button
                type="button"
                className={`${styles.menuButton} ${faseClasse}`}
                onClick={() => iniciar(chave)}
                disabled={iniciando}
              >
                <span className={styles.iconWrap}><Icone /></span>
                <span className={styles.rotulo}>{rotulo}</span>
              </button>
              <p className={styles.descricao}>{descricao}</p>
            </div>
          ))}
        </div>

        {temInstituicao() && (
          <div className={`${styles.opcao} ${styles.exclusivo} ${styles.opcaoLarga}`}>
            <button
              type="button"
              className={`${styles.menuButton} ${styles.botaoLargo} ${faseClasse}`}
              onClick={() => setSalaAberta(true)}
            >
              Casos exclusivos
            </button>
            <p className={styles.descricao}>Casos preparados pelo seu professor. Entre com o código da sala.</p>
          </div>
        )}
      </section>

      {salaAberta && (
        <SalaExclusiva onIniciar={iniciarExclusivos} onFechar={() => setSalaAberta(false)} />
      )}
    </div>
  );
}

export default Dificuldade;