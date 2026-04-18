import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Map as MapIcon, 
  PlusCircle, 
  LayoutDashboard, 
  AlertCircle, 
  Bot, 
  Heart, 
  LogOut,
  Settings,
  Bell,
  ShieldCheck,
  Building2,
  ListChecks,
  FileText,
  TrendingUp,
  Mail,
  HelpCircle,
  UserCircle,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{"role": "guest", "full_name": "زائر"}'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { label: 'الرئيسية', icon: Home, path: '/', section: 'الرئيسي' },
    { label: 'ابحث عن دواء', icon: Search, path: '/search', section: 'الرئيسي' },
    { label: 'الخريطة التفاعلية', icon: MapIcon, path: '/map', section: 'الرئيسي' },
    
    // User Section
    { label: 'تبرع بدواء', icon: PlusCircle, path: '/donate', section: 'خدمات اليوزر' },
    { label: 'لوحتي الخاصة', icon: LayoutDashboard, path: '/dashboard', section: 'خدمات اليوزر', roles: ['user', 'admin'] },
    { label: 'طلباتي', icon: ListChecks, path: '/requests', section: 'خدمات اليوزر', roles: ['user', 'admin'] },
    { label: 'تبرعاتي', icon: Heart, path: '/my-donations', section: 'خدمات اليوزر', roles: ['user', 'admin'] },
    { label: 'السجل الطبي', icon: FileText, path: '/medical-history', section: 'خدمات اليوزر', roles: ['user', 'admin'] },
    { label: 'كوبونات الخصم', icon: Heart, path: '/vouchers', section: 'خدمات اليوزر', roles: ['user', 'admin'] },

    // Pharmacy Section
    { label: 'مخزون الصيدلية', icon: Building2, path: '/pharmacy-inventory', section: 'خدمات الصيدلية', roles: ['pharmacy', 'admin'] },
    { label: 'إحصائيات الصيدلية', icon: TrendingUp, path: '/pharmacy/stats', section: 'خدمات الصيدلة', roles: ['pharmacy', 'admin'] },
    { label: 'التحكم في الأسعار', icon: Settings, path: '/pharmacy/pricing', section: 'خدمات الصيدلة', roles: ['pharmacy', 'admin'] },
    { label: 'الأدوية الراكدة', icon: ListChecks, path: '/near-expiry', section: 'خدمات الصيدلة', roles: ['pharmacy', 'admin'] },

    // Admin Section
    { label: 'لوحة الإحصائيات', icon: LayoutDashboard, path: '/admin', section: 'الإشراف', roles: ['admin'] },
    { label: 'إدارة المستخدمين', icon: Users, path: '/admin/users', section: 'الإشراف', roles: ['admin'] },
    { label: 'إحصائيات الأدوية', icon: TrendingUp, path: '/admin/analytics', section: 'الإشراف', roles: ['admin'] },
    { label: 'المشاكل والشكاوى', icon: AlertCircle, path: '/admin/reports', section: 'الإشراف', roles: ['admin'] },
    
    // Services
    { label: 'طلبات استغاثة', icon: AlertCircle, path: '/emergency', section: 'خدمات خاصة', badge: '7', badgeColor: 'bg-red-500 text-white' },
    { label: 'مساعد المزمن', icon: Bot, path: '/health-ai', section: 'خدمات خاصة' },
    { label: 'دواء مجاني', icon: Heart, path: '/verification', section: 'خدمات خاصة' },
    { label: 'تحقق الهوية', icon: ShieldCheck, path: '/account-verification', section: 'خدمات خاصة' },

    // Communication
    { label: 'الرسائل', icon: Mail, path: '/inbox', section: 'التواصل', badge: '3', badgeColor: 'bg-amber-500 text-white' },
    { label: 'الإشعارات', icon: Bell, path: '/notifications', section: 'التواصل' },
    { label: 'مركز المساعدة', icon: HelpCircle, path: '/help-center', section: 'التواصل' },

    // Settings
    { label: 'الملف الشخصي', icon: UserCircle, path: '/profile', section: 'الإعدادات' },
    { label: 'الإعدادات', icon: Settings, path: '/settings', section: 'الإعدادات' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user.role)
  );

  const sections = [...new Set(filteredNavItems.map(item => item.section))];

  return (
    <aside className="w-72 bg-primary-950 h-screen fixed right-0 top-0 text-white flex flex-col z-50 shadow-2xl overflow-hidden">
      {/* Brand */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary-500/20">
            🏥
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight">مُسند</h1>
            <p className="text-[10px] text-primary-300 font-bold tracking-widest uppercase opacity-60">Musnad Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto py-6 px-4 sidebar-scroll">
        {sections.map(section => (
          <div key={section} className="mb-8 last:mb-0">
            <h3 className="px-4 text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4 opacity-50">
              {section}
            </h3>
            <div className="space-y-1">
              {filteredNavItems.filter(item => item.section === section).map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={`nav-item-dashboard group ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <item.icon size={20} className={isActive ? 'text-primary-300' : 'text-primary-500 group-hover:text-white transition-colors'} />
                    <span className="flex-grow">{item.label}</span>
                    {item.badge && (
                      <span className={`${item.badgeColor} text-[10px] px-2 py-0.5 rounded-full font-black`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="activeSide"
                        className="absolute right-0 w-1 rounded-l-full bg-primary-400 h-8"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Footer */}
      <div className="p-6 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
            {user.full_name?.slice(0, 2) || 'يوز'}
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{user.full_name}</h4>
            <p className="text-[10px] text-primary-400 font-medium">
              {user.role === 'admin' ? 'مدير المنصة 🛡️' : user.role === 'pharmacy' ? 'صيدلية موثقة 🏥' : user.role === 'guest' ? 'زائر' : 'عضو مسند ⭐'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-500/20 text-primary-500 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
