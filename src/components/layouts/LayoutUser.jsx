import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Search, Map as MapIcon, PlusCircle, LayoutDashboard,
  ListChecks, FileText, Heart, AlertCircle, Bot,
  ShieldCheck, LogOut, Bell, HelpCircle,
  UserCircle, Mail, Menu, X
} from 'lucide-react';

const userNav = [
  { section: 'الرئيسي', items: [
    { label: 'الرئيسية', icon: Home, path: '/' },
    { label: 'ابحث عن دواء', icon: Search, path: '/search' },
    { label: 'الخريطة التفاعلية', icon: MapIcon, path: '/map' },
  ]},
  { section: 'خدماتك', items: [
    { label: 'تبرع بدواء', icon: PlusCircle, path: '/donate' },
    { label: 'لوحتي الخاصة', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'طلباتي', icon: ListChecks, path: '/requests' },
    { label: 'تبرعاتي', icon: Heart, path: '/my-donations' },
    { label: 'السجل الطبي', icon: FileText, path: '/medical-history' },
    { label: 'كوبونات الخصم', icon: Heart, path: '/vouchers' },
  ]},
  { section: 'خدمات إضافية', items: [
    { label: 'طلبات استغاثة', icon: AlertCircle, path: '/emergency', badge: '7', badgeColor: 'bg-red-500 text-white' },
    { label: 'مساعد المزمن', icon: Bot, path: '/health-ai' },
    { label: 'تحقق الهوية', icon: ShieldCheck, path: '/account-verification' },
  ]},
];

const LayoutUser = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            🏥
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">مُسند</h1>
            <p className="text-[9px] text-primary-300 font-bold uppercase tracking-widest opacity-60">Musnad Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto py-4 px-3 sidebar-scroll">
        {userNav.map(group => (
          <div key={group.section} className="mb-5">
            <p className="px-3 text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2 opacity-50">{group.section}</p>
            {group.items.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all relative
                    ${isActive
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-primary-300/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon size={17} />
                  <span className="text-sm font-bold flex-grow">{item.label}</span>
                  {item.badge && (
                    <span className={`${item.badgeColor} text-[10px] px-2 py-0.5 rounded-full font-black`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div layoutId="userActive" className="absolute right-0 w-1 h-6 bg-primary-400 rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-black text-white shrink-0">
            {user?.full_name?.slice(0, 2) || 'م'}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.full_name || 'مستخدم'}</p>
            <p className="text-[10px] text-primary-400 font-bold">عضو مسند ⭐</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-primary-400 hover:text-red-400 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]" dir="rtl">
      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="w-64 bg-primary-950 h-screen fixed right-0 top-0 flex-col z-50 shadow-2xl hidden md:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-72 bg-primary-950 h-screen fixed right-0 top-0 flex flex-col z-50 shadow-2xl md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute left-3 top-3 p-2 rounded-xl text-primary-300 hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-grow md:mr-64 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-all"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base md:text-lg font-black text-slate-800">{title || 'منصة مسند'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/inbox" className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-all">
              <Mail size={17} />
            </Link>
            <Link to="/notifications" className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-all">
              <Bell size={17} />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all">
              <UserCircle size={16} className="text-primary-600" />
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-grow animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-4 md:px-8 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200">
          منصة مسند &copy; {new Date().getFullYear()} — صُنع بحب لإنقاذ الأرواح
        </footer>
      </div>
    </div>
  );
};

export default LayoutUser;
