import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/**
 * Direction-aware "back" button. Goes to the previous page in history.
 * In RTL the arrow points right (natural "back"); in LTR it points left.
 * Hidden on the role landing pages where there's nothing to go back to.
 */
const ROOTS = ['/dashboard', '/admin', '/pharmacy/inventory', '/'];

export default function BackButton({ className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, t } = useLang();

  if (ROOTS.includes(location.pathname)) return null;

  const Icon = isRTL ? ArrowRight : ArrowLeft;
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      title={t('common.back')}
      aria-label={t('common.back')}
      className={
        className ||
        'shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all'
      }
    >
      <Icon size={18} />
    </button>
  );
}
