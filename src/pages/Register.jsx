import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, MapPin, FileText, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { useLang } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import toast from 'react-hot-toast';


const Register = () => {
  const navigate = useNavigate();
  const { t } = useLang();
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
      toast.success(role === 'pharmacy' ? t('auth.registerSuccessPharmacy') : t('auth.registerSuccess'));
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute top-6 inset-x-6 flex items-center justify-end">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 bg-white"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-[2.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-primary-500/20">
            🏥
          </div>
          <h1 className="text-3xl font-black text-slate-800">{t('auth.joinTitle')}</h1>
          <p className="text-slate-400 font-bold text-sm">{t('auth.joinSubtitle')}</p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${role === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={18} />
            {t('auth.roleIndividual')}
          </button>
          <button 
            type="button"
            onClick={() => setRole('pharmacy')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${role === 'pharmacy' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 size={18} />
            {t('auth.rolePharmacy')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={role === 'pharmacy' ? t('auth.pharmacyName') : t('auth.fullName')}
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="email"
                placeholder={t('auth.email')}
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {role === 'pharmacy' && (
              <>
                <div className="relative group">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="tel"
                    placeholder={t('auth.phone')}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <FileText className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('auth.pharmacyLicense')}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                    value={formData.pharmacy_license}
                    onChange={(e) => setFormData({...formData, pharmacy_license: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('auth.officialAddress')}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                    value={formData.pharmacy_address}
                    onChange={(e) => setFormData({...formData, pharmacy_address: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <FileText className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="url" 
                    placeholder={t('auth.pharmacyImageUrl')}
                    className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
                    value={formData.pharmacy_image_url}
                    onChange={(e) => setFormData({...formData, pharmacy_image_url: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="relative group">
              <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="password"
                placeholder={t('auth.password')}
                required
                className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm text-start"
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
            {loading ? t('auth.registering') : (
              <>
                {t('auth.register')}
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm font-bold text-slate-400 mt-6">
            {t('auth.haveAccount')}
            <Link to="/login" className="text-primary-600 mx-2 hover:underline">{t('auth.goLogin')}</Link>
          </p>
        </form>

        {role === 'pharmacy' && (
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
             <ShieldCheck className="text-amber-500 shrink-0" />
             <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
               {t('auth.pharmacyNotice')}
             </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
