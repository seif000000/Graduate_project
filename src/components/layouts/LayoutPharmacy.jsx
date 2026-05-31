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
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden" dir="rtl">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl h-screen fixed right-0 top-0 flex flex-col z-50 shadow-[0_0_50px_rgba(14,165,233,0.05)] border-l border-white/50">
        <div className="p-6 border-b border-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(14,165,233,0.2)]">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">مُسند — بوابة</h1>
              <p className="text-[10px] text-cyan-600 font-black uppercase tracking-widest">Pharmacy Portal</p>
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
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{group.section}</p>
              {group.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all relative group
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-50 to-blue-50/50 text-cyan-700 shadow-sm border border-cyan-100/50'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-cyan-600'
                      }`}
                  >
                    <item.icon size={18} className={isActive ? "text-cyan-600" : "text-slate-400 group-hover:text-cyan-500"} />
                    <span className="text-sm font-bold">{item.label}</span>
                    {isActive && (
                      <motion.div layoutId="pharmacyActive" className="absolute right-0 w-1 h-6 bg-cyan-500 rounded-l-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md">
              {user?.full_name?.slice(0, 2) || 'صي'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{user?.full_name || 'الصيدلية'}</p>
              <p className="text-[10px] text-cyan-600 font-bold">صيدلية موثقة 🏥</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow mr-72 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white px-8 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-black text-slate-800">{title || 'لوحة الصيدلية'}</h2>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-all relative border border-slate-100 shadow-sm">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100/50 shadow-sm">
              <Building2 size={16} className="text-cyan-600" />
              <span className="text-xs font-black text-cyan-700 tracking-wide">العمليات التشغيلية</span>
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
