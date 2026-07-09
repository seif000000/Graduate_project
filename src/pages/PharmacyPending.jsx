import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, LogOut, RefreshCw, Building2, FileText, MapPin } from 'lucide-react';
import { getMyProfile, getApiError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import toast from 'react-hot-toast';

/**
 * Full-screen gate shown to a pharmacy whose account has NOT yet been verified
 * by an admin. It deliberately renders NO app navigation — the pharmacy cannot
 * reach the portal until an admin verifies its data.
 */
const PharmacyPending = () => {
  const navigate = useNavigate();
  const { token, user, login, logout } = useAuth();
  const { t } = useLang();
  const [checking, setChecking] = useState(false);
  const [profile, setProfile] = useState(null);

  const refreshStatus = async (silent = false) => {
    if (!silent) setChecking(true);
    try {
      const res = await getMyProfile();
      setProfile(res.data);
      if (res.data?.is_verified) {
        // Verified now → persist and enter the portal.
        login(token, {
          role: res.data.role,
          full_name: res.data.full_name,
          is_verified: true,
        });
        toast.success(t('pharmacyPending.approved'));
        navigate('/pharmacy/inventory', { replace: true });
      } else if (!silent) {
        toast(t('pharmacyPending.stillPending'), { icon: '⏳' });
      }
    } catch (e) {
      if (!silent) toast.error(getApiError(e, t('pharmacyPending.checkFail')));
    } finally {
      if (!silent) setChecking(false);
    }
  };

  useEffect(() => {
    // Check once on mount in case an admin already approved.
    refreshStatus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-cyan-200/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-6 inset-x-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 font-black">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
            <Building2 size={18} />
          </div>
          {t('shell.pharmacyBrand')}
        </div>
        <LanguageToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-6"
      >
        <div className="w-24 h-24 mx-auto rounded-[2rem] bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner relative">
          <Clock size={44} />
          <span className="absolute -bottom-1 -end-1 w-9 h-9 rounded-2xl bg-white shadow flex items-center justify-center text-amber-500">
            <ShieldCheck size={18} />
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">{t('pharmacyPending.title')}</h1>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">{t('pharmacyPending.desc')}</p>
        </div>

        {/* Submitted data (read-only) */}
        <div className="bg-slate-50 rounded-2xl p-5 text-start space-y-3 border border-slate-100">
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-cyan-500 shrink-0" />
            <span className="text-xs font-black text-slate-400 w-24 shrink-0">{t('pharmacyPending.name')}</span>
            <span className="text-sm font-bold text-slate-700 truncate">{profile?.full_name || user?.full_name || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-cyan-500 shrink-0" />
            <span className="text-xs font-black text-slate-400 w-24 shrink-0">{t('pharmacyPending.license')}</span>
            <span className="text-sm font-bold text-slate-700 truncate">{profile?.pharmacy_license || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-cyan-500 shrink-0" />
            <span className="text-xs font-black text-slate-400 w-24 shrink-0">{t('pharmacyPending.address')}</span>
            <span className="text-sm font-bold text-slate-700 truncate">{profile?.pharmacy_address || '—'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => refreshStatus(false)}
            disabled={checking}
            className="flex-grow h-14 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
            {checking ? t('pharmacyPending.checking') : t('pharmacyPending.checkStatus')}
          </button>
          <button
            onClick={handleLogout}
            className="h-14 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {t('pharmacyPending.logout')}
          </button>
        </div>

        <p className="text-[11px] font-bold text-slate-400 leading-relaxed pt-2">{t('pharmacyPending.hint')}</p>
      </motion.div>
    </div>
  );
};

export default PharmacyPending;
