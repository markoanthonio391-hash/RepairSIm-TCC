import { useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { translations } from '../i18n/translations';

export function LanguageProvider({ children }) {
  const [idioma, setIdioma] = useState(() => localStorage.getItem('config_idioma') || 'Português');

  useEffect(() => {
    localStorage.setItem('config_idioma', idioma);
  }, [idioma]);

  const t = translations[idioma];

  return (
    <LanguageContext.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  );
}