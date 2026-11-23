import { useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { translations } from '../i18n/translations';

export function LanguageProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    try {
      return localStorage.getItem('config_idioma') || 'Português';
    } catch {
      return 'Português'; // localStorage bloqueado (modo privado)
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('config_idioma', idioma);
    } catch {
      // sem armazenamento: só não guarda a escolha
    }
  }, [idioma]);

  // se o valor salvo no navegador não existir em translations, usa Português (evita t === undefined e tela vazia)
  const t = translations[idioma] ?? translations['Português'];

  return (
    <LanguageContext.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  );
}