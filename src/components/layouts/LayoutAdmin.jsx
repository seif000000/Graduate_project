import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, TrendingUp, AlertCircle,
  Settings, LogOut, ShieldCheck, Bell, ChevronRight,
  Activity, FileText
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 h-screen fixed right-0 top-0 flex flex-col z-50 shadow-2xl">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">مُسند — أدمن</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto py-4 px-3">
          {adminNav.map(group => (
            <div key={group.section} className="mb-6">
              <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{group.section}</p>
              {group.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group relative
                      ${isActive
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-bold">{item.label}</span>
                    {isActive && (
                      <motion.div layoutId="adminActive" className="absolute right-0 w-1 h-6 bg-red-400 rounded-l-full" />
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-black text-white shrink-0">
              {user?.full_name?.slice(0, 2) || 'أد'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name || 'المدير'}</p>
              <p className="text-[10px] text-red-400 font-bold">مدير النظام 🛡️</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow mr-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-black text-slate-800">{title || 'لوحة الإدارة'}</h2>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-all relative">
              <Bell size={18} />
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-xl border border-red-100">
              <ShieldCheck size={14} className="text-red-500" />
              <span className="text-xs font-black text-red-600">صلاحيات كاملة</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-grow animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-8 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200">
          منصة مسند — لوحة الإدارة &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default LayoutAdmin;
