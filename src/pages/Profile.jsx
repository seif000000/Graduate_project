import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Shield, Award, Edit2, Building, Check, X } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../api';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setUser(res.data);
      setFormData(res.data);
      // Update local storage to keep sync
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await updateMyProfile(formData);
      setUser(res.data);
      setIsEditing(false);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('تم تحديث الملف الشخصي بنجاح! ✨', {
        style: {
          borderRadius: '15px',
          background: '#0f172a',
          color: '#fff',
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 'bold'
        },
      });
    } catch (e) {
      console.error(e);
      toast.error('عذراً، حدث خطأ أثناء التحديث. حاول مرة أخرى 💔');
    }
  };

  const stats = [
    { label: 'تبرعات مكتملة', value: '18', icon: '💊', color: 'text-emerald-600' },
    { label: 'نقاط السمعة', value: '892', icon: '⭐', color: 'text-amber-600' },
    { label: 'أيام العطاء', value: '124', icon: '📅', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary-950 p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-right">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white/10">
              {user.full_name?.slice(0, 2)}
            </div>
            <button className="absolute bottom-0 left-0 p-2 bg-white text-primary-950 rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>
          
          <div className="flex-grow space-y-2">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black outline-none focus:bg-white/20 transition-all"
                />
              ) : (
                <h1 className="text-4xl font-black">{user.full_name}</h1>
              )}
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-primary-400 border border-white/10">
                {user.role === 'admin' ? 'مدير المنصة' : user.role === 'pharmacy' ? 'صيدلية موثقة' : 'متبرع نشط ⭐'}
              </span>
            </div>
            <p className="text-slate-400 font-medium">عضو منذ {new Date(user.created_at).toLocaleDateString('ar-EG', {month: 'long', year: 'numeric'})}</p>
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <button onClick={handleUpdate} className="btn-primary h-12 px-6 flex items-center gap-2">
                    <Check size={18} /> حفظ التغييرات
                  </button>
                  <button onClick={() => {setIsEditing(false); setFormData(user);}} className="btn-secondary h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 px-6 flex items-center gap-2">
                    <X size={18} /> إلغاء
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-primary h-12 px-6 flex items-center gap-2">
                  <Edit2 size={18} /> تعديل الحساب
                </button>
              )}
              {!isEditing && (
                <button className="btn-secondary h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 px-6">
                  مشاركة الملف
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]"></div>
        <div className="absolute -bottom-10 right-10 text-[15rem] opacity-5 select-none pointer-events-none">👤</div>
      </section>

      {/* Stats Grid - Hidden for Pharmacy in this mockup to prioritize business info */}
      {user.role !== 'pharmacy' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
              {stat.icon}
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact & Business Info */}
        <section className="glass-card p-8">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            {user.role === 'pharmacy' ? <Building className="text-primary-500" /> : <User className="text-primary-500" />}
            {user.role === 'pharmacy' ? 'بيانات الصيدلية' : 'المعلومات الشخصية'}
          </h2>
          <div className="space-y-6">
            {user.role === 'pharmacy' && (
              <div className="p-4 rounded-3xl bg-primary-950 text-white flex items-center gap-6 overflow-hidden relative">
                 <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/10 shrink-0">🏥</div>
                 <div className="text-right relative z-10">
                    <p className="text-[10px] font-black text-primary-400 uppercase">صورة الصيدلية (الواجهة)</p>
                    <p className="text-sm font-bold mt-1">اضغط للتغيير</p>
                 </div>
                 <div className="absolute right-0 top-0 text-6xl opacity-10 rotate-12">📷</div>
              </div>
            )}
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                <Mail size={18} />
              </div>
              <div className="text-right flex-grow">
                <p className="text-[10px] font-black text-slate-400 uppercase">البريد الإلكتروني</p>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-transparent font-bold text-sm text-slate-700 outline-none border-b border-primary-500/30 focus:border-primary-500 py-1"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                <MapPin size={18} />
              </div>
              <div className="text-right flex-grow">
                <p className="text-[10px] font-black text-slate-400 uppercase">العنوان التفصيلي</p>
                {isEditing && user.role === 'pharmacy' ? (
                  <input 
                    type="text" 
                    value={formData.pharmacy_address || ''} 
                    onChange={(e) => setFormData({...formData, pharmacy_address: e.target.value})}
                    className="w-full bg-transparent font-bold text-sm text-slate-700 outline-none border-b border-primary-500/30 focus:border-primary-500 py-1"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.pharmacy_address || (user.role === 'pharmacy' ? 'لم يتم تحديد عنوان' : 'القاهرة، مصر')}</p>
                )}
              </div>
              {user.role === 'pharmacy' && !isEditing && (
                <button className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black rounded-lg">رؤية الخريطة</button>
              )}
            </div>

            {user.role === 'pharmacy' && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                  <Award size={18} />
                </div>
                <div className="text-right flex-grow">
                  <p className="text-[10px] font-black text-slate-400 uppercase">رقم الترخيص الطبي</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.pharmacy_license || ''} 
                      onChange={(e) => setFormData({...formData, pharmacy_license: e.target.value})}
                      className="w-full bg-transparent font-bold text-sm text-slate-700 outline-none border-b border-primary-500/30 focus:border-primary-500 py-1"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{user.pharmacy_license || 'غير متوفر'}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Details & Services */}
        <section className="glass-card p-8 bg-primary-50/50 border-primary-200">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
             <Edit2 className="text-primary-500" size={20} />
             {user.role === 'pharmacy' ? 'المواعيد والخدمات' : 'التوثيق والأوسمة'}
          </h2>
          <div className="space-y-6">
            {user.role === 'pharmacy' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">مواعيد العمل</p>
                     <p className="text-xs font-bold text-slate-700">09:00 ص - 11:59 م</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">خدمة التوصيل</p>
                     <p className="text-xs font-bold text-primary-600">متوفرة ✓</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3">
                   <p className="text-xs font-black text-slate-800 uppercase tracking-widest">خدمات إضافية</p>
                   <div className="flex flex-wrap gap-2">
                      {['قياس ضغط', 'قياس سكر', 'استشارات طبية', 'حقن عضل'].map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">{s}</span>
                      ))}
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-3xl bg-white/50 border border-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-700">توثيق الحساب (ID)</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">موثق ✓</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">تم التحقق من هويتك بنجاح. حسابك الآن يظهر للآخرين كحساب موثوق وآمن.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: '🌱', label: 'بداية الخير' },
                    { icon: '⭐', label: 'متبرع فضي' },
                    { icon: '💙', label: 'بطل مسند' }
                  ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm min-w-[100px] group hover:border-primary-300 transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">{badge.icon}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
