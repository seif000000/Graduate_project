import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Map paths to titles
  const titles = {
    '/': 'الرئيسية',
    '/search': 'البحث عن دواء',
    '/map': 'الخريطة التفاعلية',
    '/donate': 'تبرع بدواء',
    '/dashboard': 'لوحة المتبرع',
    '/emergency': 'طلبات الاستغاثة',
    '/health-ai': 'مساعد المزمن',
    '/verification': 'دواء مجاني',
    '/account-verification': 'تحقق الهوية',
    '/profile': 'الملف الشخصي',
    '/settings': 'الإعدادات',
    '/notifications': 'مركز الإشعارات',
    '/inbox': 'صندوق الرسائل',
    '/help-center': 'مركز المساعدة',
    '/admin': 'لوحة الإحصائيات',
    '/admin/users': 'إدارة المستخدمين',
    '/admin/analytics': 'إحصائيات الأدوية',
    '/admin/reports': 'المشاكل والشكاوى',
    '/pharmacy/stats': 'إحصائيات الصيدلية',
    '/pharmacy/pricing': 'التحكم في الأسعار',
    '/requests': 'طلباتي',
    '/medical-history': 'السجل الطبي',
    '/vouchers': 'كوبونات الخصم'
  };

  const currentTitle = titles[location.pathname] || 'مسند';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex bg-[#FAF9F6] min-h-screen">
      {/* Sidebar - Fixed on the right (RTL) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow mr-72 flex flex-col min-h-screen">
        <Topbar title={currentTitle} />
        
        <main className="p-8 flex-grow animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100">
          منصة مسند &copy; {new Date().getFullYear()} &mdash; صنع بحب لإنقاذ الأرواح
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
