import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import {
  TEMAS, FONTES, EFEITOS,
  lerPreferencia, salvarPreferencia, aplicarAparencia, lerEfeitos, salvarEfeitos,
} from './preferencias';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => lerPreferencia('config_tema', TEMAS, 'Escuro'));
  const [fonte, setFonte] = useState(() => lerPreferencia('config_fonte', FONTES, 'Padrão'));
  const [efeitos, setEfeitos] = useState(lerEfeitos);

  useEffect(() => { salvarPreferencia('config_tema', tema); }, [tema]);
  useEffect(() => { salvarPreferencia('config_fonte', fonte); }, [fonte]);
  useEffect(() => { salvarEfeitos(efeitos); }, [efeitos]);
  useEffect(() => { aplicarAparencia(tema, fonte, efeitos); }, [tema, fonte, efeitos]);

  const setEfeito = useCallback((chave, nivel) => {
    setEfeitos((anterior) => ({ ...anterior, [chave]: nivel }));
  }, []);

  const setTodosEfeitos = useCallback((nivel) => {
    setEfeitos(Object.fromEntries(EFEITOS.map(({ chave }) => [chave, nivel])));
  }, []);

  const valor = useMemo(
    () => ({ tema, setTema, fonte, setFonte, efeitos, setEfeito, setTodosEfeitos }),
    [tema, fonte, efeitos, setEfeito, setTodosEfeitos]
  );

  return (
    <ThemeContext.Provider value={valor}>
      {children}
    </ThemeContext.Provider>
  );
}