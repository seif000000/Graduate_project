import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Package, TrendingUp, Settings, LogOut,
  MapPin, Clock, Bell, ShieldCheck, Plus
} from 'lucide-react';

const pharmacyNav = [
  { section: 'المخزون', items: [
    { label: 'مخزون الصيدلية', icon: Package, path: '/pharmacy/inventory' },
    { label: 'أدوية قرب الانتهاء', icon: Clock, path: '/pharmacy/near-expiry' },
    { label: 'إضافة دواء', icon: Plus, path: '/pharmacy/add-medicine' },
  ]},
  { section: 'الإحصائيات', items: [
    { label: 'إحصائياتي', icon: TrendingUp, path: '/pharmacy/stats' },
    { label: 'التحكم في الأسعار', icon: Settings, path: '/pharmacy/pricing' },
  ]},
  { section: 'الموقع', items: [
    { label: 'موقعي على الخريطة', icon: MapPin, path: '/pharmacy/map' },
  ]},
];

const LayoutPharmacy = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-blue-950 h-screen fixed right-0 top-0 flex flex-col z-50 shadow-2xl">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">مُسند — صيدلية</h1>
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest opacity-60">Pharmacy Portal</p>
            </div>
          </div>
        </div>

        {/* Verification badge */}
        {user?.is_verified && (
          <div className="mx-4 mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[11px] font-black text-emerald-400">صيدلية موثقة ✓</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto py-4 px-3">
          {pharmacyNav.map(group => (
            <div key={group.section} className="mb-6">
              <p className="px-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 opacity-50">{group.section}</p>
              {group.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all relative
                      ${isActive
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-blue-300/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-bold">{item.label}</span>
                    {isActive && (
                      <motion.div layoutId="pharmacyActive" className="absolute right-0 w-1 h-6 bg-blue-400 rounded-l-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-sm font-black text-white shrink-0">
              {user?.full_name?.slice(0, 2) || 'صي'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name || 'الصيدلية'}</p>
              <p className="text-[10px] text-blue-400 font-bold">صيدلية موثقة 🏥</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-blue-400 hover:text-red-400 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow mr-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-black text-slate-800">{title || 'لوحة الصيدلية'}</h2>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-all relative">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100">
              <Building2 size={14} className="text-blue-500" />
              <span className="text-xs font-black text-blue-600">بوابة الصيدلية</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-grow animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-8 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200">
          منصة مسند — بوابة الصيدليات &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default LayoutPharmacy;
