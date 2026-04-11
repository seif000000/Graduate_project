import { motion } from 'framer-motion';
import { Search, HelpCircle, MessageCircle, Phone, Globe, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

const HelpCenter = () => {
  const categories = [
    { title: 'البداية في مسند', icon: Globe, count: 12, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'التبرع بالأدوية', icon: ShieldCheck, count: 8, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'طلب دواء مجاني', icon: MessageCircle, count: 15, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'الخصوصية والأمان', icon: HelpCircle, count: 5, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const faqs = [
    { q: 'هل يمكنني التبرع بأدوية منتهية الصلاحية؟', a: 'لا، نعتذر عن قبول أي أدوية منتهية الصلاحية لضمان سلامة المرضى. يجب أن يكون هناك شهر واحد على الأقل قبل تاريخ الانتهاء.' },
    { q: 'كيف يتم التحقق من الحالات المستحقة؟', a: 'لدينا فريق طبي وقانوني يراجع كافة المستندات والروشتات المرفوعة ويقوم بعمليات تحقق دقيقة لضمان وصول الدواء لمن يستحقه.' },
    { q: 'هل هناك تكلفة لاستلام الدواء؟', a: 'التبرعات في مسند مجانية تماماً، ولكن بعض الصيدليات قد توفر أدوية بخصومات كبيرة كجزء من مسؤوليتها المجتمعية.' },
  ];

  return (
    <div className="space-y-12 pb-12" dir="rtl">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 pb-12 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
           <h1 className="text-5xl font-black text-slate-800 leading-tight">كيف يمكننا مساعدتك اليوم؟</h1>
           <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">ابحث في قاعدة المعرفة الخاصة بنا أو ابدأ تذكرة دعم جديدة</p>
           
           <div className="max-w-2xl mx-auto relative mt-8">
             <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
             <input 
               type="text" 
               placeholder="ابحث عن حلول لمشكلتك..." 
               className="w-full bg-white border border-slate-200 h-20 pr-16 pl-16 rounded-[2rem] shadow-2xl shadow-slate-200/50 outline-none focus:border-primary-500 transition-all font-black text-lg"
             />
             <button className="absolute left-4 top-1/2 -translate-y-1/2 btn-primary h-12 px-6 rounded-2xl">بحث</button>
           </div>
        </div>

        {/* Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
          <HelpCircle size={400} />
        </div>
      </section>

      {/* Categories */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 group cursor-pointer hover:-translate-y-2 transition-all hover:bg-primary-50/10"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform ${cat.bg} ${cat.color}`}>
              <cat.icon size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{cat.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat.count} مقال</p>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-2xl font-black text-slate-800 border-r-4 border-primary-500 pr-6">الأسئلة الأكثر شيوعاً</h2>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card overflow-hidden">
                   <div className="p-6 font-black text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all group">
                      <span>{faq.q}</span>
                      <ArrowRight size={18} className="rotate-180 text-slate-300 group-hover:text-primary-500" />
                   </div>
                   <div className="p-6 pt-0 text-sm text-slate-500 font-medium leading-relaxed bg-slate-50/30">
                      {faq.a}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Reach Out */}
        <div className="space-y-8">
           <h2 className="text-2xl font-black text-slate-800 pr-2">تواصل معنا</h2>
           <div className="space-y-4">
              <div className="glass-card p-6 flex items-center gap-6 group cursor-pointer hover:border-primary-200">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">الدعم الفني</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">support@musnad.org</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-6 group cursor-pointer hover:border-primary-200">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">الخط الساخن</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">19001 (بالسعر العادي)</p>
                </div>
              </div>
              
              <div className="p-8 rounded-[2.5rem] bg-primary-950 text-white shadow-2xl space-y-6">
                 <h4 className="text-xl font-black">أرسل لنا رسالة</h4>
                 <div className="space-y-4">
                    <input type="text" placeholder="الموضوع" className="w-full bg-white/10 border border-white/10 h-12 px-6 rounded-xl font-bold outline-none focus:bg-white/20 transition-all placeholder-white/40" />
                    <textarea placeholder="رسالتك هنا..." className="w-full bg-white/10 border border-white/10 min-h-[100px] p-6 rounded-2xl font-bold outline-none focus:bg-white/20 transition-all placeholder-white/40" />
                    <button className="btn-primary w-full h-12 shadow-primary-500/20">إرسال التذكرة</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
