// CONTROLE DA MÚSICA DE FUNDO (lobby, casos e comemoração).
// Quem toca a música é o componente MusicaGlobal. Este arquivo só deixa as telas PAUSAREM a música
// enquanto um vídeo com som próprio está tocando (ex.: vídeo de finalização do caso).
//
// Uso numa tela:   usePausarMusica(mostrandoVideo);   // true = música pausada; false = música volta
import { useEffect } from 'react';

const pausas = new Set();       // quem está pedindo a pausa agora (pode haver mais de um pedido ao mesmo tempo)
const ouvintes = new Set();     // funções avisadas quando algo muda

function avisar() {
  ouvintes.forEach((funcao) => funcao());
}

export function musicaPausada() {
  return pausas.size > 0;
}

// o MusicaGlobal usa esta função para ser avisado quando a pausa muda; devolve uma função para cancelar
export function assinarMusica(funcao) {
  ouvintes.add(funcao);
  return () => ouvintes.delete(funcao);
}

export function usePausarMusica(ativo) {
  useEffect(() => {
    if (!ativo) return;

    const pedido = Symbol('pausa');
    pausas.add(pedido);
    avisar();

    return () => {
      pausas.delete(pedido);
      avisar();
    };
  }, [ativo]);
}
