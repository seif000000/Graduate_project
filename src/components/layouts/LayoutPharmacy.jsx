import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import NotificationBell from '../NotificationBell';
import BackButton from '../BackButton';
import { LanguageToggle } from '../LanguageToggle';
import {
  Building2, Package, TrendingUp, Settings, LogOut,
  Clock, Bell, ShieldCheck
} from 'lucide-react';

const pharmacyNav = [
  { labelKey: 'nav.pharmacyInventory', icon: Package, path: '/pharmacy/inventory' },
  { labelKey: 'nav.pharmacyNearExpiry', icon: Clock, path: '/pharmacy/near-expiry' },
  { labelKey: 'nav.pharmacyStats', icon: TrendingUp, path: '/pharmacy/stats' },
  { labelKey: 'nav.pricing', icon: Settings, path: '/pharmacy/pricing' },
];

const LayoutPharmacy = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLang();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Background ambient light */}
      <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-cyan-200/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-blue-300/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all border border-slate-100/50 shadow-sm" />
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(14,165,233,0.2)] text-white">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">{t('shell.pharmacyBrand')}</h1>
                {user?.is_verified && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black rounded-md flex items-center gap-1">
                    <ShieldCheck size={10} /> {t('shell.verified')}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-cyan-600 font-bold uppercase tracking-widest mt-1">Pharmacy Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle className="hidden sm:inline-flex" />
            <NotificationBell className="relative w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-all border border-slate-100/50 shadow-sm" iconSize={16} />

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm">
                {user?.full_name?.slice(0, 2) || 'صي'}
              </div>
              <div className="text-start hidden sm:block">
                <p className="text-xs font-black text-slate-800 max-w-[120px] truncate">{user?.full_name || t('shell.pharmacy')}</p>
                <p className="text-[9px] text-slate-400 font-bold">{t('role.pharmacyPortal')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                title={t('shell.logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sub Header Navigation Strip */}
        <div className="bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex overflow-x-auto scrollbar-hide">
            {pharmacyNav.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative shrink-0 border-b-2
                    ${isActive
                      ? 'text-cyan-600 border-cyan-500 bg-white/50 font-black'
                      : 'text-slate-500 border-transparent hover:text-cyan-600 hover:bg-white/30'
                    }`}
                >
                  <item.icon size={14} className={isActive ? "text-cyan-600" : "text-slate-400"} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-8 relative z-10 animate-fade-in">
        {children}
      </main>

      <footer className="bg-white/80 border-t border-slate-100 py-6 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest relative z-10">
        {t('footer.pharmacyTagline')} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default LayoutPharmacy;
