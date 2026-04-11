import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Upload, Search, Download, Trash2, Calendar, FileType, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMedicalReports, getMedicationLogs } from '../api';

const MedicalHistory = () => {
  const [reports, setReports] = useState([]);
  const [medicationLog, setMedicationLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMedicalReports(),
      getMedicationLogs()
    ]).then(([reportsRes, logsRes]) => {
      setReports(reportsRes.data);
      setMedicationLog(logsRes.data);
    }).catch(err => {
      console.error(err);
      toast.error('حدث خطأ في تحميل السجل الطبي');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <FileText className="text-primary-600" size={40} />
            السجل الطبي والتقارير
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة مستنداتك الطبية وسجل استهلاك الأدوية الخاص بك</p>
        </div>
        <button className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20">
           <Plus size={18} /> إضافة مستند جديد
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <section className="lg:col-span-2 space-y-6">
           <div className="glass-card p-8">
              <h2 className="text-xl font-black text-slate-800 mb-8 border-r-4 border-primary-500 pr-6">مستنداتي المرفوعة</h2>
              <div className="space-y-4">
                 {loading ? <div className="text-center text-slate-400">جاري التحميل...</div> : reports.length === 0 ? <div className="text-center text-slate-400">لا يوجد مستندات</div> : reports.map((report, i) => (
                   <motion.div
                     key={report.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-white hover:border-primary-100 transition-all group"
                   >
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:scale-110">
                            {report.type === 'PDF' ? <FileType size={24} /> : <Upload size={24} />}
                         </div>
                         <div className="text-right">
                            <h3 className="font-black text-slate-800 text-sm">{report.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">
                               <span>{report.date}</span>
                               <span>•</span>
                               <span>{report.size}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-primary-600 shadow-sm flex items-center justify-center transition-all"><Download size={18} /></button>
                         <button className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>

           {/* Medical Timeline */}
           <div className="glass-card p-10">
              <h2 className="text-xl font-black text-slate-800 mb-8 border-r-4 border-primary-500 pr-6">سجل العلاج</h2>
              <div className="relative border-r-2 border-slate-100 pr-8 mr-4 space-y-12">
                 {loading ? <div className="text-center text-slate-400">جاري التحميل...</div> : medicationLog.length === 0 ? <div className="text-center text-slate-400">لا يوجد سجل</div> : medicationLog.map((log, i) => (
                   <div key={i} className="relative group">
                      <div className="absolute right-[-34px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary-500 group-hover:bg-primary-500 transition-all" />
                      <div className="text-right space-y-2">
                         <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{log.date}</p>
                         <h4 className="font-black text-slate-800 text-lg">{log.med}</h4>
                         <p className="text-sm text-slate-500 font-medium">{log.note}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Sidebar Status/Help */}
        <section className="space-y-6">
           <div className="glass-card p-8 bg-primary-950 text-white border-0 overflow-hidden relative">
              <div className="relative z-10 space-y-6 text-right">
                 <ShieldCheck className="text-primary-400" size={40} />
                 <h3 className="text-xl font-black tracking-tight leading-tight">حالة التوثيق الصحي</h3>
                 <p className="text-xs text-white/50 font-medium leading-relaxed leading-tight text-justify">تم التحقق من 3 من أصل 5 مستندات مقدمة. يرجى التأكد من أن جميع التقارير حديثة ومختومة ليتم قبول طلبات صرف الدواء بسلاسة.</p>
                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary-500 h-full w-[60%]" />
                 </div>
                 <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">نسبة اكتمال ملفك الطبي: 60%</p>
              </div>
              <div className="absolute -bottom-20 -left-20 text-[18rem] opacity-5 select-none pointer-events-none rotate-12">🧘</div>
           </div>

           <div className="glass-card p-8 space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">تحميل سريع للتقارير</h4>
              <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center gap-4 hover:border-primary-200 transition-all cursor-pointer group">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                 <p className="text-xs font-black text-slate-500">اسحب الملف هنا أو انقر للاختيار</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default MedicalHistory;
