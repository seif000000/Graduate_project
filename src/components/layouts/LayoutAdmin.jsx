import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, TrendingUp, AlertCircle,
  Settings, LogOut, ShieldCheck, Bell, Activity, Menu, X
} from 'lucide-react';

const adminNav = [
  { section: 'الرئيسي', items: [
    { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin' },
    { label: 'إدارة المستخدمين', icon: Users, path: '/admin/users' },
    { label: 'توثيق الصيدليات', icon: ShieldCheck, path: '/admin/pharmacies' },
  ]},
  { section: 'التحليلات', items: [
    { label: 'إحصائيات الأدوية', icon: TrendingUp, path: '/admin/analytics' },
    { label: 'سجلات النظام', icon: Activity, path: '/admin/reports' },
  ]},
  { section: 'الإعدادات', items: [
    { label: 'الإعدادات', icon: Settings, path: '/admin/settings' },
  ]},
];

const LayoutAdmin = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-5 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,var(--color-red-500)_0%,transparent_70%)] opacity-20" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">مُسند — قيادة</h1>
            <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto py-4 px-3">
        {adminNav.map(group => (
          <div key={group.section} className="mb-5">
            <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{group.section}</p>
            {group.items.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group relative
                    ${isActive
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon size={17} className={isActive ? 'text-red-400' : ''} />
                  <span className="text-sm font-bold">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="adminActive" className="absolute right-0 w-1 h-6 bg-red-500 rounded-l-full shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            {user?.full_name?.slice(0, 2) || 'أد'}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.full_name || 'المدير'}</p>
            <p className="text-[10px] text-red-400 font-bold tracking-wider">SYSTEM ADMIN</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300" dir="rtl">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="w-64 bg-slate-900 h-screen fixed right-0 top-0 flex-col z-50 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-l border-white/5 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-72 bg-slate-900 h-screen fixed right-0 top-0 flex flex-col z-50 border-l border-white/5 md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute left-3 top-3 p-2 rounded-xl text-slate-400 hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="flex-grow md:mr-64 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300 transition-all border border-white/5"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base md:text-lg font-black text-white">{title || 'لوحة الإدارة'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300 transition-all relative border border-white/5">
              <Bell size={17} />
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">3</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-xl border border-red-500/20">
              <ShieldCheck size={14} className="text-red-400" />
              <span className="text-xs font-black text-red-400 tracking-wider">ROOT ACCESS</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-grow animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-4 md:px-8 py-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] border-t border-white/5">
          مُسند — نظام الإدارة المركزية &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default LayoutAdmin;
