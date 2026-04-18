import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Trash2, AlertTriangle, Building, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUnverifiedPharmacies, verifyPharmacy, getAdminStats } from '../api';

const Admin = () => {
  const navigate = useNavigate();
  const [unverifiedPharmacies, setUnverifiedPharmacies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pharmaciesRes, statsRes] = await Promise.all([
        getUnverifiedPharmacies(),
        getAdminStats()
      ]);
      setUnverifiedPharmacies(pharmaciesRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await verifyPharmacy(userId);
      setUnverifiedPharmacies(prev => prev.filter(p => p.id !== userId));
      alert("تم توثيق الصيدلية بنجاح!");
    } catch (e) {
      console.error(e);
      alert("فشل التوثيق");
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <ShieldCheck className="text-red-600" size={40} />
            لوحة الإشراف العليا
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة الوثائق، توثيق الهويات، ومراقبة المحتوى</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <Building className="text-red-500" />
              طلبات توثيق الصيدليات
            </h2>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{unverifiedPharmacies.length} معلق</span>
          </div>

          <div className="space-y-4">
             {unverifiedPharmacies.map((pharmacy) => (
                <motion.div 
                  key={pharmacy.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 flex flex-wrap items-center justify-between gap-6 hover:border-primary-200 transition-all"
                >
                   <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner">🏥</div>
                      <div className="text-right">
                         <h3 className="font-black text-slate-800">{pharmacy.full_name}</h3>
                         <p className="text-xs font-bold text-slate-400">{pharmacy.email}</p>
                         <p className="text-[10px] text-primary-600 font-bold mt-1">تاريخ التسجيل: {pharmacy.created_at}</p>
                      </div>
                   </div>
                   
                   <div className="flex gap-3">
                      <button className="h-12 px-6 rounded-xl bg-slate-50 text-slate-400 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
                         <Search size={16} />
                         عرض الملفات
                      </button>
                      <button 
                        onClick={() => handleVerify(pharmacy.id)}
                        className="h-12 px-6 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
                      >
                         <UserCheck size={16} />
                         توثيق الآن
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="glass-card p-8 bg-slate-800 text-white border-0 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-500),transparent)]"></div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                 <AlertTriangle className="text-amber-400" />
                 إجراءات سريعة
              </h3>
               <div className="space-y-3 relative z-10">
                  <button 
                    onClick={() => navigate('/emergency')}
                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm flex items-center justify-between px-6 group"
                  >
                     <span>حظر محتوى مخالف (SOS)</span>
                     <Trash2 size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => alert("سيتم تفعيل نظام التقارير قريباً")}
                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm flex items-center justify-between px-6 group"
                  >
                     <span>مراجعة التقارير</span>
                     <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">12!</span>
                  </button>
               </div>
           </div>

           <div className="glass-card p-8 border-red-100 bg-red-50/20">
              <h3 className="text-base font-black text-red-900 mb-4 tracking-tight">إحصائيات المنصة</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-red-100 pb-3">
                    <span className="text-xs font-bold text-slate-500">إجمالي المستخدمين</span>
                    <span className="text-sm font-black text-red-600">{stats?.total_users || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-red-100 pb-3">
                    <span className="text-xs font-bold text-slate-500">صيدليات مسجلة</span>
                    <span className="text-sm font-black text-red-600">{stats?.total_pharmacies || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-red-100 pb-3">
                    <span className="text-xs font-bold text-slate-500">تبرعات مكتملة</span>
                    <span className="text-sm font-black text-red-600">{stats?.total_delivered || 0}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">نسبة النجاح</span>
                    <span className="text-sm font-black text-red-600">{stats?.success_rate || 0}%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
