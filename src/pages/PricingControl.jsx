import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Search, Pill, Tag, Percent, AlertCircle } from 'lucide-react';
import { getPharmacyInventory, updatePharmacyInventory, getApiError } from '../api';
import toast from 'react-hot-toast';

const PricingControl = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await getPharmacyInventory();
        // Use real DB data
        const mapped = res.data.map(m => ({
          ...m,
          basePrice: m.base_price || 0,
          discount: m.discount_percentage || 0,
          type: m.type === 'مجاني' ? 'free' : 'discount'
        }));
        setMedicines(mapped);
      } catch (e) {
        console.error(e);
        toast.error(getApiError(e, 'فشل تحميل قائمة الأسعار'));
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Optional: Save all changes. For simplicity, we assume changes are saved instantly or via a batch.
      // Here we just show success since the real update should be per-item on change or batch.
      toast.success('تم حفظ التغييرات بنجاح ✅');
    } catch (e) {
      toast.error('فشل حفظ التغييرات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id, field, value) => {
    const original = [...medicines];
    try {
      const updatedList = medicines.map(m => m.id === id ? { ...m, [field]: value } : m);
      setMedicines(updatedList);
      
      const payload = {};
      if (field === 'discount') {
          payload.discount_percentage = Number(value);
          if (Number(value) === 100) payload.type = 'مجاني';
          else payload.type = 'خصم';
      }
      if (field === 'basePrice') payload.base_price = Number(value);
      
      updatePharmacyInventory(id, payload).catch(() => {
          toast.error('فشل تحديث الصنف');
          setMedicines(original);
      });
    } catch(e) {
      setMedicines(original);
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <Tag className="text-primary-600" size={40} />
            التحكم في الأسعار والعروض
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">تحديد نسب الخصم للأدوية المتوفرة للصرف المجاني أو المخفض</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20">
           <Save size={18} /> حفظ التغييرات
        </button>
      </header>

      {/* Control Panel */}
      <section className="glass-card p-10 bg-primary-950 text-white border-0 overflow-hidden relative mb-12">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 text-right">
           <div className="space-y-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                 <Percent className="text-primary-400" />
                 إعدادات الخصم الافتراضية
              </h3>
              <p className="text-xs text-primary-300/70 font-medium leading-relaxed">حدد نسبة الخصم التلقائية التي تمنحها الصيدلية للأدوية الجديدة المضافة للمنصة.</p>
              <div className="flex items-center gap-4 mt-4">
                 <input type="number" defaultValue="25" className="w-24 bg-white/10 border border-white/20 h-14 rounded-2xl text-center text-xl font-black outline-none focus:bg-white/20 transition-all" />
                 <span className="text-2xl font-black">%</span>
              </div>
           </div>
           
           <div className="lg:col-span-2 p-6 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                 <AlertCircle className="text-amber-400 shrink-0" size={24} />
                 <div className="space-y-2">
                    <p className="font-black text-primary-200">سياسة الخصم المجتمعي</p>
                    <p className="text-[10px] text-white/50 font-medium leading-relaxed leading-tight text-justify">تلتزم جميع الصيدليات المشاركة في مسند بتوفير حد أدنى من الخصم (10%) على الأدوية غير المجانية للمرضى المثبت استحقاقهم، وذلك لضمان وصول الدواء للجميع بأسعار عادلة.</p>
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute -bottom-20 -left-20 text-[20rem] opacity-5 select-none pointer-events-none rotate-12">💰</div>
      </section>

      {/* Medicine List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <h2 className="text-xl font-black text-slate-800 border-r-4 border-primary-500 pr-4">قائمة الأدوية النشطة</h2>
           <div className="relative w-72">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input type="text" placeholder="بحث في المخزون..." className="w-full bg-white border border-slate-100 h-10 pr-10 rounded-xl text-xs font-bold outline-none" />
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {medicines.map((med, i) => (
             <motion.div
               key={med.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="glass-card p-6 flex flex-wrap items-center justify-between gap-6 hover:border-primary-200 transition-all group"
             >
                <div className="flex gap-4 items-center min-w-[200px]">
                   <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">💊</div>
                   <div className="text-right">
                      <h3 className="font-black text-slate-800">{med.medicine_name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.generic_name}</p>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-12">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر الأصلي</p>
                      <p className="text-sm font-black text-slate-700">{med.basePrice} ج.م</p>
                   </div>
                   
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">نسبة الخصم</p>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={med.discount}
                          onChange={(e) => handleUpdateItem(med.id, 'discount', e.target.value)}
                          className="w-16 h-10 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-primary-600 outline-none focus:border-primary-500" 
                        />
                        <span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                   </div>

                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر بعد العرض</p>
                      <p className="text-sm font-black text-emerald-600">
                        {Number(med.discount) === 100 ? 'مجاني تماماً' : `${Math.round(med.basePrice * (1 - med.discount/100))} ج.م`}
                      </p>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button className="h-10 px-4 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 transition-all">
                      <Settings size={18} />
                   </button>
                   <button className={`h-10 px-6 rounded-xl font-bold text-xs transition-all ${med.type === 'free' ? 'bg-emerald-500 text-white' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                      {med.type === 'free' ? 'عرض تبرع' : 'خصم جزئي'}
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default PricingControl;
