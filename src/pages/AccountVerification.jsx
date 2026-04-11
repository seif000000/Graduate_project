import { motion } from 'framer-motion';
import { ShieldCheck, User, Smartphone, MapPin, Camera, CheckCircle, ArrowRight, ArrowLeft, Upload, FileText } from 'lucide-react';
import { useState } from 'react';

const AccountVerification = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
    }, 2000);
  };

  if (isDone) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8" dir="rtl">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-5xl mx-auto shadow-2xl shadow-emerald-200"
        >
          ✓
        </motion.div>
        <div className="space-y-4">
           <h1 className="text-3xl font-black text-slate-800">تم إرسال بياناتك بنجاح!</h1>
           <p className="text-slate-500 font-medium">يقوم فريق مسند حالياً بمراجعة مستنداتك. ستصلك رسالة تأكيد فور الانتهاء من عملية التحقق (عادة ما تستغرق 24-48 ساعة).</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn-primary h-14 px-12">العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12" dir="rtl">
      {/* Stepper Header */}
      <header className="space-y-6">
        <div className="flex justify-between items-center text-right">
           <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-800">تحقق الهوية</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">خطوات بسيطة لتوثيق حسابك وجعله أكثر أماناً</p>
           </div>
           <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-600' : 'bg-slate-200'}`} />
              ))}
           </div>
        </div>
      </header>

      {/* Step Content */}
      <div className="glass-card p-10 min-h-[500px] flex flex-col justify-between overflow-hidden relative">
         <motion.div
           key={step}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex-grow space-y-10"
         >
            {step === 1 && (
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-r-4 border-primary-500 pr-6">
                     <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner"><User size={24} /></div>
                     <h2 className="text-2xl font-black text-slate-800">المعلومات الشخصية</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 text-right">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">الاسم الرباعي (كما في البطاقة)</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all" placeholder="أحمد محمود علي..." />
                     </div>
                     <div className="space-y-2 text-right">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">رقم الهاتف المحمول</label>
                        <input type="tel" className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all text-left" placeholder="+20 1xx xxxx xxx" />
                     </div>
                     <div className="md:col-span-2 space-y-2 text-right">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">العنوان بالتفصيل</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 min-h-[100px] p-6 rounded-[2rem] font-bold outline-none focus:border-primary-500 transition-all" placeholder="المحافظة، المنطقة، واسم الشارع..." />
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-r-4 border-primary-500 pr-6">
                     <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner"><Smartphone size={24} /></div>
                     <h2 className="text-2xl font-black text-slate-800">إثبات الهوية</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center gap-6 group hover:border-primary-200 transition-all cursor-pointer">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary-500 shadow-sm transition-transform group-hover:scale-110"><Camera size={40} /></div>
                        <div className="space-y-2">
                           <p className="font-black text-slate-800">وجه البطاقة الأمامي</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JPG or PNG (Max 5MB)</p>
                        </div>
                     </div>
                     <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center gap-6 group hover:border-primary-200 transition-all cursor-pointer">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary-500 shadow-sm transition-transform group-hover:scale-110"><Camera size={40} /></div>
                        <div className="space-y-2">
                           <p className="font-black text-slate-800">وجه البطاقة الخلفي</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JPG or PNG (Max 5MB)</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                     <FileText size={20} className="text-slate-400 shrink-0" />
                     <p className="text-xs text-slate-500 font-medium leading-relaxed leading-tight text-justify">تأكد من أن جميع أركان البطاقة واضحة وأن النصوص والبيانات مقروءة بشكل جيد تحت إضاءة جيدة.</p>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-12 text-center py-12">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-150">
                     <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-3xl font-black text-slate-800">المراجعة النهائية</h2>
                     <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">بمجرد الضغط على إرسال، سيتولى فريقنا الفني مراجعة مستنداتك والتأكد من مطابقتها للمعايير الأمنية. هل أنت متأكد من صحة كافة البيانات المذكورة؟</p>
                  </div>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto p-6 rounded-3xl bg-slate-50 border border-slate-100">
                     {[
                        'سيتم تشفير كافة بياناتك وحمايتها',
                        'لا نشارك بياناتك مع أي جهات خارجية',
                        'تتم المراجعة بواسطة خبراء معتمدين'
                     ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                           <CheckCircle size={14} className="text-emerald-500" /> {t}
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </motion.div>

         {/* Navigation Buttons */}
         <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
            {step > 1 ? (
               <button onClick={prevStep} className="btn-secondary h-12 px-8 flex items-center gap-2">
                  <ArrowRight size={18} /> السابق
               </button>
            ) : <div />}
            
            {step < 3 ? (
               <button onClick={nextStep} className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20">
                  التالي <ArrowLeft size={18} />
               </button>
            ) : (
               <button 
                onClick={handleSubmit} 
                className={`btn-primary h-14 px-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 flex items-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال للتوثيق'} <ShieldCheck size={18} />
               </button>
            )}
         </div>

         {/* Decorative Background */}
         <div className="absolute -top-10 -left-10 text-[15rem] opacity-5 select-none pointer-events-none -rotate-12">🛡️</div>
      </div>
    </div>
  );
};

export default AccountVerification;
