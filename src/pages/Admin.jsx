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
          <h1 className="text-4xl font-black text-white flex items-center gap-4">
            <ShieldCheck className="text-red-500" size={40} />
            لوحة الإشراف العليا
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة الوثائق، توثيق الهويات، ومراقبة المحتوى</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between mb-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Building className="text-red-400" />
              طلبات توثيق الصيدليات
            </h2>
            <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">{unverifiedPharmacies.length} معلق</span>
          </div>

          <div className="space-y-4">
             {unverifiedPharmacies.map((pharmacy) => (
                <motion.div 
                  key={pharmacy.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 hover:border-red-500/30 transition-all shadow-lg"
                >
                  <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-white/5 shadow-inner">🏥</div>
                      <div className="text-right">
                         <h3 className="font-black text-white">{pharmacy.full_name}</h3>
                         <p className="text-xs font-bold text-slate-400">{pharmacy.email}</p>
                         <p className="text-[10px] text-red-400 font-bold mt-1">تاريخ التسجيل: {pharmacy.created_at}</p>
                      </div>
                   </div>
                   
                   <div className="flex gap-3">
                      <button className="h-12 px-6 rounded-xl bg-slate-800 border border-white/5 text-slate-300 font-bold text-sm hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2">
                         <Search size={16} />
                         عرض الملفات
                      </button>
                      <button 
                        onClick={() => handleVerify(pharmacy.id)}
                        className="h-12 px-6 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2"
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
           <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
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

           <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <h3 className="text-base font-black text-white mb-4 tracking-tight flex items-center gap-2">
                 <ShieldCheck className="text-red-500" size={18} />
                 إحصائيات المنصة
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">إجمالي المستخدمين</span>
                    <span className="text-sm font-black text-white">{stats?.total_users || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">صيدليات مسجلة</span>
                    <span className="text-sm font-black text-white">{stats?.total_pharmacies || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">تبرعات مكتملة</span>
                    <span className="text-sm font-black text-white">{stats?.total_delivered || 0}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">نسبة النجاح</span>
                    <span className="text-sm font-black text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">{stats?.success_rate || 0}%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
