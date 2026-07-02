import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

const getInitialLang = () => {
  const saved = typeof localStorage !== 'undefined' && localStorage.getItem('lang');
  return saved === 'en' || saved === 'ar' ? saved : 'ar';
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Apply <html lang / dir> so the whole app (and CSS) follows the language.
  useLayoutEffect(() => {
    const el = document.documentElement;
    el.setAttribute('lang', lang);
    el.setAttribute('dir', dir);
  }, [lang, dir]);

  const setLang = useCallback((next) => {
    if (next !== 'ar' && next !== 'en') return;
    localStorage.setItem('lang', next);
    setLangState(next);
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  const t = useCallback(
    (key) => (translations[lang] && translations[lang][key]) || translations.ar[key] || key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, isRTL: dir === 'rtl', t, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if used outside the provider (keeps components from crashing).
    return { lang: 'ar', dir: 'rtl', isRTL: true, t: (k) => translations.ar[k] || k, setLang: () => {}, toggle: () => {} };
  }
  return ctx;
}
