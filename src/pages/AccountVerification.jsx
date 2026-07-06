import { motion } from 'framer-motion';
import { ShieldCheck, User, Smartphone, MapPin, Camera, CheckCircle, ArrowRight, ArrowLeft, Upload, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { verifyDocuments } from '../api';
import { useLang } from '../context/LanguageContext';

const AccountVerification = () => {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    front_id: null,
    back_id: null
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const data = new FormData();
    data.append('full_name', formData.full_name);
    if (formData.phone) data.append('phone', formData.phone);
    if (formData.address) data.append('address', formData.address);
    if (formData.front_id) data.append('front_id', formData.front_id);
    if (formData.back_id) data.append('back_id', formData.back_id);

    try {
       await verifyDocuments(data);
       setIsDone(true);
    } catch (e) {
       toast.error(getApiError(e, t('verification.submitError')));
    } finally {
       setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-5xl mx-auto shadow-2xl shadow-emerald-200"
        >
          ✓
        </motion.div>
        <div className="space-y-4">
           <h1 className="text-3xl font-black text-slate-800">{t('accVerify.sentTitle')}</h1>
           <p className="text-slate-500 font-medium">{t('accVerify.sentDesc')}</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn-primary h-14 px-12">{t('accVerify.backHome')}</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Stepper Header */}
      <header className="space-y-6">
        <div className="flex justify-between items-center text-start">
           <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-800">{t('accVerify.pageTitle')}</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{t('accVerify.pageSub')}</p>
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
                  <div className="flex items-center gap-4 border-s-4 border-primary-500 ps-6">
                     <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner"><User size={24} /></div>
                     <h2 className="text-2xl font-black text-slate-800">{t('accVerify.personalInfo')}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ps-2">{t('accVerify.fullNameLabel')}</label>
                        <input
                           type="text"
                           value={formData.full_name}
                           onChange={e => setFormData({...formData, full_name: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all"
                           placeholder={t('accVerify.fullNamePlaceholder')}
                        />
                     </div>
                     <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ps-2">{t('accVerify.phoneLabel')}</label>
                        <input
                           type="tel"
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all text-start"
                           placeholder={t('accVerify.phonePlaceholder')}
                        />
                     </div>
                     <div className="md:col-span-2 space-y-2 text-start">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ps-2">{t('accVerify.addressLabel')}</label>
                        <textarea
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 min-h-[100px] p-6 rounded-[2rem] font-bold outline-none focus:border-primary-500 transition-all"
                           placeholder={t('accVerify.addressPlaceholder')}
                        />
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-8">
                  <div className="flex items-center gap-4 border-s-4 border-primary-500 ps-6">
                     <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner"><Smartphone size={24} /></div>
                     <h2 className="text-2xl font-black text-slate-800">{t('accVerify.idProof')}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div onClick={() => frontInputRef.current?.click()} className={`p-10 rounded-[2.5rem] border-2 border-dashed ${formData.front_id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 bg-slate-50'} flex flex-col items-center justify-center text-center gap-6 group hover:border-primary-200 transition-all cursor-pointer`}>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary-500 shadow-sm transition-transform group-hover:scale-110"><Camera size={40} /></div>
                        <div className="space-y-2">
                           <p className="font-black text-slate-800">{formData.front_id ? formData.front_id.name : t('accVerify.frontId')}</p>
                           {!formData.front_id && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('accVerify.imgFormat')}</p>}
                        </div>
                        <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={e => setFormData({...formData, front_id: e.target.files[0]})} />
                     </div>
                     <div onClick={() => backInputRef.current?.click()} className={`p-10 rounded-[2.5rem] border-2 border-dashed ${formData.back_id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 bg-slate-50'} flex flex-col items-center justify-center text-center gap-6 group hover:border-primary-200 transition-all cursor-pointer`}>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary-500 shadow-sm transition-transform group-hover:scale-110"><Camera size={40} /></div>
                        <div className="space-y-2">
                           <p className="font-black text-slate-800">{formData.back_id ? formData.back_id.name : t('accVerify.backId')}</p>
                           {!formData.back_id && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('accVerify.imgFormat')}</p>}
                        </div>
                        <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={e => setFormData({...formData, back_id: e.target.files[0]})} />
                     </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                     <FileText size={20} className="text-slate-400 shrink-0" />
                     <p className="text-xs text-slate-500 font-medium leading-relaxed leading-tight text-justify">{t('accVerify.clarityNote')}</p>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-12 text-center py-12">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-150">
                     <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-3xl font-black text-slate-800">{t('accVerify.finalReview')}</h2>
                     <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">{t('accVerify.finalReviewDesc')}</p>
                  </div>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto p-6 rounded-3xl bg-slate-50 border border-slate-100">
                     {[
                        t('accVerify.assure1'),
                        t('accVerify.assure2'),
                        t('accVerify.assure3')
                     ].map((line, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                           <CheckCircle size={14} className="text-emerald-500" /> {line}
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
                  <ArrowRight size={18} /> {t('accVerify.prev')}
               </button>
            ) : <div />}

            {step < 3 ? (
               <button onClick={nextStep} className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20">
                  {t('accVerify.next')} <ArrowLeft size={18} />
               </button>
            ) : (
               <button
                onClick={handleSubmit}
                className={`btn-primary h-14 px-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 flex items-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  {isSubmitting ? t('accVerify.submitting') : t('accVerify.submit')} <ShieldCheck size={18} />
               </button>
            )}
         </div>

         {/* Decorative Background */}
         <div className="absolute -top-10 -end-10 text-[15rem] opacity-5 select-none pointer-events-none -rotate-12">🛡️</div>
      </div>
    </div>
  );
};

export default AccountVerification;
