import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, AlertTriangle, Clock, Calendar, MessageCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { getNearExpiry, getApiError } from '../api';
import toast from 'react-hot-toast';

const NearExpiry = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearExpiry = async () => {
      try {
        const response = await getNearExpiry();
        setMedicines(response.data);
      } catch (error) {
        console.error("Error fetching near expiry medicines:", error);
        toast.error(getApiError(error, 'فشل تحميل الأدوية الراكدة'));
      } finally {
        setLoading(false);
      }
    };
    fetchNearExpiry();
  }, []);

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
             <ListChecks className="text-amber-500" size={40} />
             الأدوية الراكدة (قريبة الانتهاء)
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة المخزون الحساس لضمان توزيعه قبل فوات الأوان</p>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
         <div className="flex gap-4 items-start max-w-2xl text-right">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
               <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
               <h3 className="text-lg font-black text-amber-900">انتبه! الأدوية هنا تحتاج لتصرف سريع</h3>
               <p className="text-sm text-amber-700/70 font-medium">سيقوم النظام تلقائياً بتمييز هذه الأدوية في نتائج البحث العامة لتشجيع الصيدليات الأخرى والمستخدمين على استهلاكها فوراً.</p>
            </div>
         </div>
         <button className="h-14 px-10 rounded-2xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30">تحميل تقرير التلف</button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : medicines.length === 0 ? (
        <div className="glass-card p-16 text-center text-slate-400 font-bold space-y-4">
           <div className="text-5xl">✅</div>
           <p>لا يوجد أدوية قريبة الانتهاء في مخزنك حالياً. عمل متميز!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {medicines.map((med) => (
             <motion.div 
               key={med.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card p-0 overflow-hidden group hover:border-amber-200 transition-all"
             >
                <div className="p-6 space-y-4">
                   <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                         <Clock size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 italic">Expires Soon</span>
                   </div>
                   
                   <div className="text-right space-y-1">
                      <h4 className="text-xl font-black text-slate-800">{med.medicine_name}</h4>
                      <p className="text-xs font-bold text-slate-400 underline decoration-primary-200">{med.generic_name}</p>
                   </div>

                   <div className="flex gap-4 pt-4 border-t border-slate-50">
                      <div className="flex-grow text-right">
                         <p className="text-[10px] font-black text-slate-300 uppercase mb-1">تاريخ الانتهاء</p>
                         <p className="text-sm font-black text-red-500 flex items-center gap-2">
                            <Calendar size={14} />
                            {med.expiry_date}
                         </p>
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-300 uppercase mb-1">الكمية</p>
                         <p className="text-sm font-black text-slate-800">{med.quantity}</p>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                   <button className="flex-grow h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all flex items-center justify-center gap-2">
                      <MessageCircle size={16} />
                      عرض الطلبات
                   </button>
                   <button className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                      <ArrowLeft size={18} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default NearExpiry;
