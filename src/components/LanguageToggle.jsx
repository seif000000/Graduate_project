import { Globe } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/** A compact language switch (العربية ⇄ English) usable in navbars/headers. */
export function LanguageToggle({ className = '' }) {
  const { t, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      title={t('lang.switchTo')}
      className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-600 font-black text-xs hover:border-primary-300 hover:text-primary-600 transition-all ${className}`}
    >
      <Globe size={16} />
      {t('lang.switchTo')}
    </button>
  );
}

export default LanguageToggle;
