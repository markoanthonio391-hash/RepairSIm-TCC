import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSound } from '../context/useSound';
import { useJogo } from '../context/JogoContext';
import { assinarMusica, musicaPausada } from '../audio/musicaControle';

// MÚSICA DE FUNDO DO JOGO (um único player para o site inteiro, por isso a música NÃO reinicia ao trocar de tela dentro do mesmo grupo).
//   lobby       -> todas as telas iniciais (Home, Login, Dificuldade, Configurações...). Repete sempre.
//   casos       -> durante os casos: tela do cliente, tela do caso e relatório. Repete sempre.
//   comemoracao -> tela de resultado. Toca UMA vez só (sem repetir).
// O volume segue o volume da tela de Configurações (volume 0 = mudo).
const FAIXAS = {
  lobby: { src: '/audios/musica_lobby.mp3', loop: true },
  casos: { src: '/audios/musica_casos.mpeg', loop: true },
  comemoracao: { src: '/audios/comemoracao.mpeg', loop: false }
};

const GANHO_MUSICA = 0.6;   // a música fica um pouco abaixo dos sons de clique (1 = mesmo volume do slider)
const FADE_MS = 500;        // duração da suavização ao trocar de música ou pausar

function faixaDaRota(pathname, jogoFinalizado) {
  const rota = pathname.toLowerCase();

  if (/^\/(cliente|caso|relatorio)(\/|$)/.test(rota)) {
    return 'casos';
  }

  if (rota === '/resultado' && jogoFinalizado) {
    return 'comemoracao';
  }

  return 'lobby';
}

function MusicaGlobal() {
  const { pathname } = useLocation();
  const { volume } = useSound();
  const { jogatina } = useJogo();

  const faixaDesejada = faixaDaRota(pathname, Boolean(jogatina.finalizada));
  const volumeBase = ((volume / 100) ** 2) * GANHO_MUSICA; // ao quadrado, igual aos sons de clique

  const audios = useRef(null);       // { lobby: Audio, casos: Audio, comemoracao: Audio }
  const fades = useRef(new Map());   // fades em andamento (um por áudio)
  const bloqueado = useRef(false);   // o navegador barrou o som automático (ainda não houve clique)
  const estado = useRef({ faixaDesejada, volumeBase });

  useEffect(() => {
    estado.current = { faixaDesejada, volumeBase };
  });

  // muda o volume de forma suave; "fim" roda quando termina
  function suavizar(audio, alvo, fim) {
    clearInterval(fades.current.get(audio));

    const inicio = audio.volume;
    const t0 = performance.now();

    const timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / FADE_MS);
      audio.volume = Math.min(1, Math.max(0, inicio + (alvo - inicio) * k));

      if (k >= 1) {
        clearInterval(timer);
        fades.current.delete(audio);
        fim?.();
      }
    }, 30);

    fades.current.set(audio, timer);
  }

  // Coloca cada música no estado certo: a desejada toca (se não estiver pausada nem no mudo), as outras silenciam.
  // É chamada sempre que algo muda (rota, volume, pausa de vídeo, primeiro clique do usuário).
  function sincronizar() {
    if (!audios.current) {
      audios.current = {};

      for (const [nome, faixa] of Object.entries(FAIXAS)) {
        const audio = new Audio(faixa.src);
        audio.loop = faixa.loop;
        audio.preload = 'auto';
        audio.volume = 0;
        audios.current[nome] = audio;
      }
    }

    const { faixaDesejada: desejada, volumeBase: base } = estado.current;
    const silencio = musicaPausada() || base === 0;

    for (const [nome, audio] of Object.entries(audios.current)) {
      if (nome === desejada && !silencio) {
        // a comemoração toca só uma vez: depois que termina, não toca de novo enquanto estiver nesta tela
        if (audio.ended && !FAIXAS[nome].loop) {
          continue;
        }

        if (audio.paused) {
          audio.play().then(() => {
            bloqueado.current = false;
          }).catch(() => {
            bloqueado.current = true; // sem clique ainda: tenta de novo no primeiro clique/tecla
          });
        }

        suavizar(audio, base);
      } else if (nome === desejada) {
        // pausa temporária (vídeo com som ou volume no mudo): guarda a posição para continuar depois
        suavizar(audio, 0, () => {
          if (estado.current.faixaDesejada === nome) audio.pause();
        });
      } else if (!audio.paused || audio.currentTime > 0) {
        // música que saiu de cena: silencia e volta ao começo
        suavizar(audio, 0, () => {
          if (estado.current.faixaDesejada !== nome) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
    }
  }

  // roda quando muda a música da rota ou o volume
  useEffect(() => {
    sincronizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faixaDesejada, volumeBase]);

  // roda quando um vídeo pede para pausar a música, e no primeiro clique/tecla (os navegadores só liberam o som depois disso)
  useEffect(() => {
    const cancelar = assinarMusica(sincronizar);

    const aoInteragir = () => {
      if (bloqueado.current) sincronizar();
    };

    window.addEventListener('pointerdown', aoInteragir);
    window.addEventListener('keydown', aoInteragir);

    return () => {
      cancelar();
      window.removeEventListener('pointerdown', aoInteragir);
      window.removeEventListener('keydown', aoInteragir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ao fechar o site/app: para tudo
  useEffect(() => () => {
    const mapa = fades.current;
    mapa.forEach((timer) => clearInterval(timer));
    mapa.clear();
    Object.values(audios.current || {}).forEach((audio) => audio.pause());
  }, []);

  return null;
}

export default MusicaGlobal;
