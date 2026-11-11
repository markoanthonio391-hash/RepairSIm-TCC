import { useState, useEffect, useCallback, useMemo } from 'react';
import { SoundContext } from './SoundContext';
import { sounds } from '../audio/sounds';

export function SoundProvider({ children }) {
  const [volume, setVolume] = useState(() => {
    const salvo = localStorage.getItem('config_volume_pct');
    return salvo !== null ? Number(salvo) : 70;
  });

  useEffect(() => {
    localStorage.setItem('config_volume_pct', String(volume));
  }, [volume]);

  const play = useCallback((nome) => {
    if (volume === 0) return;
    // ao quadrado: o ouvido percebe volume de forma não linear, então o slider fica mais natural
    sounds[nome]?.((volume / 100) ** 2);
  }, [volume]);

  const value = useMemo(() => ({ volume, setVolume, play }), [volume, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}