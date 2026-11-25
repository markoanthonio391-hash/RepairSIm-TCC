import { useState, useEffect, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { TEMAS, FONTES, lerPreferencia, salvarPreferencia, aplicarAparencia } from './preferencias';

// Guarda o tema (Escuro/Claro) e o tamanho da fonte, salva no navegador e avisa o CSS pelos
// atributos data-tema e data-fonte do <html>. Todas as telas reagem sozinhas (veja temas.css).
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => lerPreferencia('config_tema', TEMAS, 'Escuro'));
  const [fonte, setFonte] = useState(() => lerPreferencia('config_fonte', FONTES, 'Padrão'));

  useEffect(() => { salvarPreferencia('config_tema', tema); }, [tema]);
  useEffect(() => { salvarPreferencia('config_fonte', fonte); }, [fonte]);
  useEffect(() => { aplicarAparencia(tema, fonte); }, [tema, fonte]);

  const valor = useMemo(() => ({ tema, setTema, fonte, setFonte }), [tema, fonte]);

  return (
    <ThemeContext.Provider value={valor}>
      {children}
    </ThemeContext.Provider>
  );
}
