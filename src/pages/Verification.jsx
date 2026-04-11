import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Upload, CheckCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

const Verification = () => {
  return (
    <div className="max-w-5xl mx-auto pb-12" dir="rtl">
      {/* Page Header */}
      <header className="mb-12 text-right space-y-2">
        <h1 className="text-4xl font-black text-slate-800">🏥 طلب دواء مجاني</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">نتحقق من الحالات بعناية لضمان وصول الدواء لمن يستحقه فعلاً</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Application Form */}
        <div className="lg:col-span-2 space-y-8">
           <section className="glass-card p-10 space-y-8">
              <div className="space-y-2 text-right border-r-4 border-primary-500 pr-6">
                 <h2 className="text-2xl font-black text-slate-800">بيانات الطلب الجديد</h2>
                 <p className="text-slate-500">يرجى رفع المستندات الطبية الرسمية الحديثة.</p>
              </div>

              <div className="space-y-6">
                 {/* Document Upload Blocks */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-200 transition-all group flex flex-col items-center justify-center text-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                          <Upload size={24} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">صورة الروشتة</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JPG, PNG up to 5MB</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-200 transition-all group flex flex-col items-center justify-center text-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                          <FileText size={24} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">تقرير طبي رسمي</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PDF, JPG up to 10MB</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">وصف الحالة (اختياري)</label>
                    <textarea 
                      placeholder="اشرح لنا حالتك أو الحالة التي تطلب لها الدواء..." 
                      className="w-full bg-slate-50 border border-slate-200 min-h-[120px] p-6 rounded-3xl outline-none focus:border-primary-500 transition-all font-bold text-slate-800"
                    />
                 </div>

                 <div className="flex items-start gap-4 p-6 bg-primary-50 rounded-3xl border border-primary-100">
                    <ShieldCheck className="text-primary-600 shrink-0 mt-1" size={24} />
                    <div className="text-right space-y-1">
                       <p className="text-sm font-black text-primary-900">أوافق على سياسة التحقق</p>
                       <p className="text-xs text-primary-700 font-medium leading-relaxed opacity-70">أقر بأن جميع البيانات والمستندات المرفقة صحيحة وتحت طائلة المسؤولية، وأوافق على مشاركتها مع الفريق الطبي المختص بالمنصة.</p>
                    </div>
                 </div>

                 <button className="btn-primary w-full h-16 text-lg shadow-primary-600/20">ارسال الطلب للمراجعة</button>
              </div>
           </section>

           {/* Previous Applications */}
           <section className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 pr-2">طلباتي السابقة</h3>
              <div className="glass-card overflow-hidden">
                  <div className="divide-y divide-slate-50">
                     {[].length > 0 ? [].map(app => (
                       <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="text-right flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">💊</div>
                             <div>
                                <p className="font-black text-slate-800">{app.med}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                   <span>{app.id}</span>
                                   <span>•</span>
                                   <span>{app.date}</span>
                                </div>
                             </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${app.statusColor}`}>
                             {app.status}
                          </div>
                       </div>
                     )) : (
                       <div className="p-12 text-center text-slate-400 font-bold">لا يوجد طلبات سابقة.</div>
                     )}
                  </div>
              </div>
           </section>
        </div>

        {/* Sidebar Help/FAQ */}
        <div className="space-y-8">
           <section className="glass-card p-8 bg-primary-950 text-white border-none overflow-hidden relative">
              <div className="relative z-10 space-y-6 text-right">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                 <h4 className="text-xl font-black leading-tight">شروط الموافقة</h4>
                 <ul className="space-y-4 text-xs text-white/60 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>وجود روشتة طبية حديثة ومختومة.</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>تطابق اسم المريض مع الهوية المقدمة.</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>ألا يكون الدواء من أدوية الجدول (المخدرات).</span>
                    </li>
                 </ul>
              </div>
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12">❤️</div>
           </section>

           <section className="glass-card p-8 space-y-6">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <HelpCircle size={16} className="text-amber-500" /> أسئلة شائعة
              </h4>
              <div className="space-y-4">
                 {[
                   'كم تستغرق عملية المراجعة؟',
                   'ماذا أفعل في حالة الرفض؟',
                   'كيف استلم الدواء بعد الموافقة؟'
                 ].map((q, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-right">
                      <p className="text-xs font-black text-slate-700">{q}</p>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Verification;
