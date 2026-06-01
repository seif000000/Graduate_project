import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../utils/getHomeRoute';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', // FastAPI uses username for email
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(new URLSearchParams(formData));
      const userData = {
        role: response.data.role,
        full_name: response.data.full_name,
        is_verified: response.data.is_verified
      };
      
      authLogin(response.data.access_token, userData);

      const from = location.state?.from?.pathname;
      const defaultHome = getHomeRoute(response.data.role, response.data.is_verified);
      navigate(from && from !== '/' && from !== '/login' ? from : defaultHome, { replace: true });
    } catch (error) {
      alert(error.response?.data?.detail || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="absolute top-8 right-8">
        <Link to="/" className="flex items-center gap-2 text-slate-400 font-bold hover:text-primary-600 transition-colors">
          <ArrowLeft size={20} />
          العودة للرئيسية
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-10 bg-white"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-[2.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-primary-500/20">
            🏥
          </div>
          <h1 className="text-3xl font-black text-slate-800">مرحباً بعودتك</h1>
          <p className="text-slate-400 font-bold text-sm">سجل دخولك لمتابعة نشاطك في مُسند</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="البريد الإلكتروني"
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 pr-12 pl-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

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
            {loading ? "جاري تسجيل الدخول..." : (
              <>
                تسجيل الدخول
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm font-bold text-slate-400 mt-6">
            ليس لديك حساب؟ 
            <Link to="/register" className="text-primary-600 mr-2 hover:underline">إنشاء حساب جديد</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
