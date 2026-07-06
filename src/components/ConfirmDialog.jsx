import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/**
 * ConfirmDialog — a styled, RTL-aware, animated confirmation modal.
 *
 * Props:
 *   open        boolean   — whether the dialog is visible
 *   title       string    — dialog heading (defaults to t('confirm.genericTitle'))
 *   message     string    — body text
 *   variant     'delete' | 'ban' | 'generic'   — controls button colour
 *   onConfirm   () => void
 *   onCancel    () => void
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  variant = 'delete',
  onConfirm,
  onCancel,
}) => {
  const { t } = useLang();

  const defaultTitle =
    variant === 'delete'
      ? t('confirm.deleteTitle')
      : variant === 'ban'
      ? t('confirm.banTitle')
      : t('confirm.genericTitle');

  const confirmBtnClass =
    variant === 'delete'
      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
      : variant === 'ban'
      ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
      : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20';

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          {/* Card */}
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 end-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                variant === 'delete'
                  ? 'bg-red-50 text-red-500'
                  : variant === 'ban'
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-primary-50 text-primary-600'
              }`}
            >
              <AlertTriangle size={32} />
            </div>

            {/* Text */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-black text-slate-800">
                {title || defaultTitle}
              </h2>
              {message && (
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {message}
                </p>
              )}
              <p className="text-xs text-slate-400 font-bold">
                {t('confirm.irreversible')}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-12 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-600 font-black text-sm hover:bg-slate-100 transition-all"
              >
                {t('confirm.no')}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 h-12 rounded-2xl text-white font-black text-sm shadow-lg transition-all ${confirmBtnClass}`}
              >
                {t('confirm.yes')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
