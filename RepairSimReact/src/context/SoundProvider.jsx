import { useState, useEffect, useCallback, useMemo } from 'react';
import { SoundContext } from './SoundContext';
import { sounds } from '../audio/sounds';

export function SoundProvider({ children }) {
  const [volume, setVolume] = useState(() => {
    try {
      const salvo = localStorage.getItem('config_volume_pct');
      if (salvo === null) return 70;
      // valor estragado no navegador viraria NaN e quebraria o som: força um número entre 0 e 100
      return Math.min(100, Math.max(0, Number(salvo) || 0));
    } catch {
      return 70;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('config_volume_pct', String(volume));
    } catch {
      // modo privado de alguns navegadores: o som funciona igual, só não guarda o volume
    }
  }, [volume]);

  const play = useCallback((nome) => {
    if (volume === 0) return;
    // ao quadrado: o ouvido percebe volume de forma não linear, então o slider fica mais natural
    sounds[nome]?.((volume / 100) ** 2);
  }, [volume]);

  const value = useMemo(() => ({ volume, setVolume, play }), [volume, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}