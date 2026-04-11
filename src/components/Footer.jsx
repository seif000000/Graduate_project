import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-200 group-hover:rotate-12 transition-transform">
                <Heart size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                مُسند
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              منصة إنسانية تقنية تهدف لسد الفجوة بين فائض الأدوية واحتياجات المرضى، لنصنع معاً مجتمعاً أكثر تراحماً وصحة.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-all border border-slate-100">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">روابط سريعة</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link to="/search" className="hover:text-primary-600 transition-colors">البحث عن دواء</Link></li>
              <li><Link to="/donate" className="hover:text-primary-600 transition-colors">تبرع بدواء</Link></li>
              <li><Link to="/community" className="hover:text-primary-600 transition-colors">المجتمع والطلبات</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">عن المنصة</Link></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">إرشادات هامة</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li>قواعد قبول الأدوية</li>
              <li>سياسة الخصوصية</li>
              <li>الشروط والأحكام</li>
              <li>الأسئلة الشائعة</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">اتصل بنا</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-3"><Phone size={16} className="text-primary-500" /> +20 123 456 789</li>
              <li className="flex items-center gap-3"><Mail size={16} className="text-primary-500" /> support@musnad.org</li>
              <li className="flex items-center gap-3"><MapPin size={16} className="text-primary-500" /> القاهرة، جمهورية مصر العربية</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 font-medium">
            جميع الحقوق محفوظة © {new Date().getFullYear()} منصة مُسند الإنسانية
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
