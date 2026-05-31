import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, MessageCircle, MoreVertical, Trash2, CheckCircle, ShieldAlert, UserX, Clock } from 'lucide-react';
import { getAdminReports, getApiError } from '../api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAdminReports();
        setReports(res.data);
      } catch (e) {
        console.error(e);
        toast.error(getApiError(e, 'فشل تحميل البلاغات'));
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getPriorityBadge = (p) => {
    switch(p) {
      case 'high': return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full tracking-widest">🔴 عاجل</span>;
      case 'medium': return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full tracking-widest">🟡 متوسط</span>;
      case 'low': return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-widest">🔵 منخفض</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="space-y-2 text-right">
        <h2 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <ShieldAlert className="text-red-600" size={40} />
          المشاكل والشكاوى
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">مراجعة بلاغات المستخدمين وحل النزاعات التقنية والسلوكية</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
           <div className="glass-card p-6 bg-red-50/50 border-red-100">
              <h3 className="text-sm font-black text-red-900 mb-4 opacity-70 uppercase tracking-widest">بلاغات مفتوحة</h3>
              <p className="text-4xl font-display font-black text-red-600">{reports.filter(r => r.status === 'open').length}</p>
           </div>
           <div className="glass-card p-6 bg-amber-50/50 border-amber-100">
              <h3 className="text-sm font-black text-amber-900 mb-4 opacity-70 uppercase tracking-widest">قيد التحقيق</h3>
              <p className="text-4xl font-display font-black text-amber-600">{reports.filter(r => r.status === 'investigating').length}</p>
           </div>
           <div className="glass-card p-6 bg-emerald-50/50 border-emerald-100">
              <h3 className="text-sm font-black text-emerald-900 mb-4 opacity-70 uppercase tracking-widest">تم حلها</h3>
              <p className="text-4xl font-display font-black text-emerald-600">{reports.filter(r => r.status === 'resolved').length}</p>
           </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-3 space-y-4">
           {reports.map((report, i) => (
             <motion.div 
               key={report.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`glass-card p-8 border-transparent hover:border-slate-200 transition-all ${report.status === 'open' ? 'ring-2 ring-red-500/20' : ''}`}
             >
                <div className="flex flex-wrap items-start justify-between gap-6">
                   <div className="space-y-4 flex-grow text-right">
                      <div className="flex items-center gap-3">
                         {getPriorityBadge(report.priority)}
                         <h3 className="text-xl font-black text-slate-800">{report.subject}</h3>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{report.description}</p>
                      <div className="flex items-center gap-6 pt-2">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <MessageCircle size={14} /> مستخدم #{report.user_id}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={14} /> {new Date(report.created_at).toLocaleString('ar-EG')}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                            <AlertCircle size={14} /> {report.type === 'medicine' ? 'شكوى دواء' : report.type === 'user' ? 'شكوى مستخدم' : 'شكوى تقنية'}
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2 shrink-0">
                      <button className="btn-primary h-12 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">
                         <CheckCircle size={18} /> حل المشكلة
                      </button>
                      <button className="btn-secondary h-12 px-6 text-red-600 border-red-100 hover:bg-red-50 flex items-center gap-2">
                         <UserX size={18} /> حظر المستخدم
                      </button>
                      <button className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all self-end">
                         <MoreVertical size={20} />
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
