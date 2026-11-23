import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem('config_tema') || 'Escuro';
    } catch {
      return 'Escuro'; // localStorage bloqueado (modo privado)
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('config_tema', tema);
    } catch {
      // sem armazenamento: só não guarda a escolha
    }
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}