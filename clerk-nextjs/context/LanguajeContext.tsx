'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Tipamos el contexto para mayor seguridad
interface LanguageContextType {
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage debe usarse dentro de un LanguageProvider");
  return context;
};