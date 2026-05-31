import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, MapPin, FileText, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' or 'pharmacy'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    phone: '',
    pharmacy_license: '',
    pharmacy_address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...formData, role });
      alert(role === 'pharmacy' ? "تم التسجيل بنجاح! بانتظار مراجعة الأدمن للتوثيق." : "تم التسجيل بنجاح!");
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.detail || "فشل التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 bg-white"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-[2.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-primary-500/20">
            🏥
          </div>
          <h1 className="text-3xl font-black text-slate-800">انضم إلى مُسند</h1>
          <p className="text-slate-400 font-bold text-sm">شارك الدواء، أنقذ حياة — اختر نوع الحساب المناسب لك</p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${role === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={18} />
            فرد (متبرع/مستلم)
          </button>
          <button 
            type="button"
            onClick={() => setRole('pharmacy')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${role === 'pharmacy' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 size={18} />
            صيدلية
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={role === 'pharmacy' ? "اسم الصيدلية" : "الاسم بالكامل"}
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="البريد الإلكتروني"
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {role === 'pharmacy' && (
              <>
                <div className="relative group">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="tel" 
                    placeholder="رقم الهاتف"
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="رقم ترخيص الصيدلية"
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                    value={formData.pharmacy_license}
                    onChange={(e) => setFormData({...formData, pharmacy_license: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="العنوان الرسمي"
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                    value={formData.pharmacy_address}
                    onChange={(e) => setFormData({...formData, pharmacy_address: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="url" 
                    placeholder="رابط صورة الصيدلية (اختياري)"
                    className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                    value={formData.pharmacy_image_url}
                    onChange={(e) => setFormData({...formData, pharmacy_image_url: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="كلمة المرور"
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? "جاري إنشاء الحساب..." : (
              <>
                إنشاء حساب جديد
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm font-bold text-slate-400 mt-6">
            لديك حساب بالفعل؟ 
            <Link to="/login" className="text-primary-600 mr-2 hover:underline">تسجيل الدخول</Link>
          </p>
        </form>

        {role === 'pharmacy' && (
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
             <ShieldCheck className="text-amber-500 shrink-0" />
             <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
               يتعين على الصيدليات تقديم بيانات الترخيص الصحيحة. سيقوم فريقنا بمراجعة حسابك وتوثيقه خلال 24 ساعة لتتمكن من استخدام كافة الصلاحيات.
             </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
