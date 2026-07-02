import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Upload, CheckCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const Verification = () => {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <header className="mb-12 text-start space-y-2">
        <h1 className="text-4xl font-black text-slate-800">{t('verification.pageTitle')}</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('verification.pageSub')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Application Form */}
        <div className="lg:col-span-2 space-y-8">
           <section className="glass-card p-10 space-y-8">
              <div className="space-y-2 text-start border-s-4 border-primary-500 ps-6">
                 <h2 className="text-2xl font-black text-slate-800">{t('verification.newRequestData')}</h2>
                 <p className="text-slate-500">{t('verification.newRequestDesc')}</p>
              </div>

              <div className="space-y-6">
                 {/* Document Upload Blocks */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-200 transition-all group flex flex-col items-center justify-center text-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                          <Upload size={24} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">{t('verification.prescriptionImg')}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('verification.prescriptionFormat')}</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-200 transition-all group flex flex-col items-center justify-center text-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                          <FileText size={24} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">{t('verification.medicalReport')}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('verification.reportFormat')}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2 text-start">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('verification.caseDescLabel')}</label>
                    <textarea
                      placeholder={t('verification.caseDescPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 min-h-[120px] p-6 rounded-3xl outline-none focus:border-primary-500 transition-all font-bold text-slate-800"
                    />
                 </div>

                 <div className="flex items-start gap-4 p-6 bg-primary-50 rounded-3xl border border-primary-100">
                    <ShieldCheck className="text-primary-600 shrink-0 mt-1" size={24} />
                    <div className="text-start space-y-1">
                       <p className="text-sm font-black text-primary-900">{t('verification.policyTitle')}</p>
                       <p className="text-xs text-primary-700 font-medium leading-relaxed opacity-70">{t('verification.policyDesc')}</p>
                    </div>
                 </div>

                 <button className="btn-primary w-full h-16 text-lg shadow-primary-600/20">{t('verification.submitRequest')}</button>
              </div>
           </section>

           {/* Previous Applications */}
           <section className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 ps-2">{t('verification.myPrevRequests')}</h3>
              <div className="glass-card overflow-hidden">
                  <div className="divide-y divide-slate-50">
                     {[].length > 0 ? [].map(app => (
                       <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="text-start flex items-center gap-4">
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
                       <div className="p-12 text-center text-slate-400 font-bold">{t('verification.noPrevRequests')}</div>
                     )}
                  </div>
              </div>
           </section>
        </div>

        {/* Sidebar Help/FAQ */}
        <div className="space-y-8">
           <section className="glass-card p-8 bg-primary-950 text-white border-none overflow-hidden relative">
              <div className="relative z-10 space-y-6 text-start">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                 <h4 className="text-xl font-black leading-tight">{t('verification.approvalTerms')}</h4>
                 <ul className="space-y-4 text-xs text-white/60 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>{t('verification.term1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>{t('verification.term2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                       <CheckCircle size={14} className="text-primary-400 shrink-0 mt-0.5" />
                       <span>{t('verification.term3')}</span>
                    </li>
                 </ul>
              </div>
              <div className="absolute -bottom-10 -start-10 text-9xl opacity-10 rotate-12">❤️</div>
           </section>

           <section className="glass-card p-8 space-y-6">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <HelpCircle size={16} className="text-amber-500" /> {t('verification.faq')}
              </h4>
              <div className="space-y-4">
                 {[
                   t('verification.faq1'),
                   t('verification.faq2'),
                   t('verification.faq3')
                 ].map((q, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-start">
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
