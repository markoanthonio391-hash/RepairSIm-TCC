import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('config_tema') || 'Escuro');

  useEffect(() => {
    localStorage.setItem('config_tema', tema);
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}