import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Info, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Package, 
  Tag, 
  MapPin, 
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import { donateMedicine } from '../api';
import { getCurrentLocation } from '../utils/geolocation';

const Donate = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: 'Glucophage 850mg',
    generic_name: 'Metformin HCL',
    quantity: '40 قرص',
    expiry_date: '2026-12',
    location: 'المعادي، القاهرة',
    latitude: null,
    longitude: null,
    is_near_expiry: false,
    batch_info: '',
    price: 'مجاني'
  });

  useEffect(() => {
    getCurrentLocation().then(coords => {
      setFormData(prev => ({ ...prev, ...coords }));
    }).catch(e => console.warn("Location not provided"));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local URL for the image to display it if needed
      const imageUrl = URL.createObjectURL(file);
      // Simulate AI scanning delay then advance to step 2
      setTimeout(() => {
        nextStep();
      }, 1000);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleDonate = async () => {
    setIsSubmitting(true);
    try {
      await donateMedicine(formData);
      setStep(5); // Success state
    } catch (error) {
      console.error("Donation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'تصوير الدواء', sub: 'استخدم الكاميرا للمسح التلقائي' },
    { id: 2, title: 'تفاصيل الدواء', sub: 'تأكيد البيانات والمواصفات' },
    { id: 3, title: 'حالة الدواء', sub: 'تاريخ الانتهاء والكمية' },
    { id: 4, title: 'طريقة التسليم', sub: 'اختر أنسب وسيلة لنا ولك' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12" dir="rtl">
      {/* Progress Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-2">🎁 تبرع بدواء</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">ساعدنا نوفر الدواء لمستحقيه — خطوة بخطوة</p>
        
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 right-0 h-0.5 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-4 ${
                  step === s.id 
                  ? 'bg-primary-950 text-white border-primary-100 scale-110 shadow-xl' 
                  : step > s.id 
                  ? 'bg-primary-500 text-white border-primary-50' 
                  : 'bg-white text-slate-300 border-slate-50'
                }`}
              >
                {step > s.id ? <CheckCircle2 size={24} /> : s.id}
              </div>
              <div className="hidden sm:block absolute top-16 whitespace-nowrap">
                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-slate-800' : 'text-slate-300'}`}>
                  {s.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Form Content */}
      <div className="glass-card p-10 relative overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
              <div className="text-right space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">التقط صورة لعلبة الدواء 📸</h2>
                 <p className="text-slate-500">نظامنا الذكي بيتعرف على اسم الدواء وتاريخ الصلاحية أوتوماتيكياً من الصورة.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                 <label className="cursor-pointer aspect-square rounded-3xl border-4 border-dashed border-primary-100 bg-primary-50/30 flex flex-col items-center justify-center gap-4 group hover:bg-primary-50 transition-all relative overflow-hidden">
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-xl shadow-primary-200/50 group-hover:scale-110 transition-transform">
                       <Camera size={32} />
                    </div>
                    <span className="font-black text-primary-700">فتح الكاميرا للمسح</span>
                 </label>
                 <label className="cursor-pointer aspect-square rounded-3xl border-4 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center gap-4 group hover:bg-slate-50 transition-all font-bold text-slate-400 relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-100 transition-transform group-hover:scale-110">
                       <Upload size={32} />
                    </div>
                    <span>ارفع صورة من الجهاز</span>
                 </label>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl flex gap-4 text-right border border-amber-100">
                 <Info className="text-amber-600 shrink-0" size={24} />
                 <p className="text-sm text-amber-800 leading-relaxed font-medium">نصيحة: تأكد من وضوح اسم الدواء (العلمي والتجاري) والباركود في الصورة لضمان أفضل نتيجة للتحقق الفوري.</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
              <div className="text-right space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">تأكيد بيانات الدواء 📝</h2>
                 <p className="text-slate-500">تم التعرف على البيانات التالية، يرجى التأكد من صحتها.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-right">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الاسم التجاري</label>
                    <input 
                      type="text" 
                      value={formData.medicine_name}
                      onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الاسم العلمي</label>
                    <input 
                      type="text" 
                      value={formData.generic_name}
                      onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الشركة المصنعة</label>
                    <input 
                      type="text" 
                      placeholder="مثلاً: شركة النيل للأدوية"
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الباركود (اختياري)</label>
                    <input 
                       type="text" 
                       placeholder="أدخل الباركود إذا وجد..."
                       className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" size={20} />
                 <span className="text-sm font-black text-emerald-800">الدواء مطابق للمواصفات وآمن للتداول ✅</span>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
               <div className="text-right space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">الكمية وتاريخ الانتهاء 📅</h2>
                 <p className="text-slate-500">هذه البيانات ضرورية لضمان سلامة المرضى الآخرين.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 text-right">
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2 flex items-center gap-2">
                          <Calendar size={14} className="text-primary-500" /> تاريخ انتهاء الصلاحية
                        </label>
                        <input 
                          type="month" 
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2 flex items-center gap-2">
                           <Package size={14} className="text-primary-500" /> اجمالي الكمية المتاحة
                        </label>
                        <div className="flex gap-4">
                           <input 
                             type="text" 
                             placeholder="مثلاً: 2 شريط / 1 علبة" 
                             value={formData.quantity}
                             onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                             className="flex-grow bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                           />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                         <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 checked={formData.is_near_expiry}
                                 onChange={(e) => setFormData({...formData, is_near_expiry: e.target.checked})}
                                 className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary-500 focus:ring-primary-500"
                               />
                               <span className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">الدواء يقترب من انتهاء الصلاحية</span>
                            </label>
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pr-1">رقم التشغيلة / Batch No (اختياري)</label>
                            <input 
                              type="text" 
                              value={formData.batch_info}
                              onChange={(e) => setFormData({...formData, batch_info: e.target.value})}
                              placeholder="أدخل رقم التشغيلة للتتبع..."
                              className="w-full bg-slate-50 border border-slate-200 h-14 pr-6 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">💊</div>
                      <div className="space-y-1">
                         <h4 className="text-lg font-black text-slate-800">أقراص مغلفة</h4>
                         <p className="text-xs font-bold text-slate-400">يرجى التأكد من أن الأشرطة لم يتم فتحها</p>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 flex-grow"
            >
               <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-fade-in">✅</div>
                 <h2 className="text-2xl font-black text-slate-800">رائع! الدواء جاهز للتبرع 🎊</h2>
                 <p className="text-slate-500 max-w-sm mx-auto">اختر كيف تريد تسليم الدواء للبدء في إنقاذ حياة إنسان اليوم.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-right">
                  <button className="p-8 rounded-3xl border-2 border-primary-100 bg-primary-50/20 hover:bg-primary-50 transition-all group text-right space-y-2">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 mb-4 transition-transform group-hover:scale-110">
                        <MapPin size={24} />
                     </div>
                     <h3 className="font-black text-primary-900">أقرب صيدلية مشاركة</h3>
                     <p className="text-xs text-primary-700 font-medium leading-relaxed">يمكنك ترك الدواء في صيدلية "الإيمان" بوسط البلد، وسنقوم بتوجيهه للمريض.</p>
                  </button>

                  <button className="p-8 rounded-3xl border-2 border-slate-100 bg-white hover:bg-slate-50 transition-all group text-right space-y-2 shadow-sm">
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4 transition-transform group-hover:scale-110">
                        <Users className="text-blue-500" size={24} />
                     </div>
                     <h3 className="font-black text-slate-800">التوصيل المباشر للمريض</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed">سنقوم بربطك بمريض في محيطك الجغرافي تم التحقق من حالته الصحية مسبقاً.</p>
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-auto pt-12 flex justify-between gap-4">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`btn-secondary h-14 px-8 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowRight size={18} />
            السابق
          </button>

          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              className="btn-primary h-14 px-10 shadow-primary-600/20"
            >
              المتابعة للخطوة التالية
              <ArrowLeft size={18} />
            </button>
          ) : step === 4 ? (
            <button 
              onClick={handleDonate}
              disabled={isSubmitting}
              className="btn-primary h-14 px-10 shadow-primary-600/20 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري النشر...' : 'تأكيد ونشر التبرع الآن'}
              <CheckCircle2 size={18} />
            </button>
          ) : (
            <button 
              onClick={() => { setStep(1); }}
              className="btn-primary h-14 px-10 shadow-primary-600/20"
            >
              تبرع بدواء آخر
              <PlusCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Safety Footer */}
      <footer className="mt-12 flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">بيانات مشفرة وآمنة</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-slate-300"></div>
         <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-primary-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">تحت إشراف طبي كامل</span>
         </div>
      </footer>
    </div>
  );
};

export default Donate;
