import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Package, Clock, CheckCircle, XCircle, Trash2, MapPin, Search } from 'lucide-react';
import { getMyDonations, deleteDonation, getApiError } from '../api';
import toast from 'react-hot-toast';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const res = await getMyDonations();
      setDonations(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل التبرعات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التبرع؟')) {
      try {
        await deleteDonation(id);
        setDonations(donations.filter(d => d.id !== id));
      } catch (e) {
        toast.error(getApiError(e, 'حدث خطأ أثناء الحذف'));
      }
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'delivered': return { label: 'تم التسليم', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' };
      case 'reserved': return { label: 'محجوز', icon: Clock, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' };
      default: return { label: 'متوفر', icon: Package, color: 'text-primary-600 bg-primary-50', border: 'border-primary-100' };
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <Heart className="text-red-600" size={40} />
            تبرعاتي
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة ومتابعة الأدوية التي قمت بالتبرع بها</p>
        </div>
      </header>

      {donations.length === 0 && !loading ? (
        <div className="glass-card p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl opacity-50">🎁</div>
           <h3 className="text-xl font-black text-slate-800">لا يوجد تبرعات بعد</h3>
           <p className="text-slate-400 font-bold">ابدأ بنشر أول تبرع لك وساعد الآخرين!</p>
           <button className="btn-primary px-8 h-12">تبرع بمبالغ أو دواء</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {donations.map((don, i) => {
            const status = getStatusInfo(don.status);
            return (
              <motion.div
                key={don.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-0 overflow-hidden border-transparent hover:border-primary-200 transition-all flex flex-col md:flex-row group"
              >
                 <div className={`w-2 shrink-0 ${status.color.split(' ')[1].replace('-50', '-500')}`} />
                 
                 <div className="flex-grow p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-6 items-start text-right w-full md:w-auto">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          💊
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800">{don.name}</h3>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                             <MapPin size={12} className="text-primary-500" />
                             {don.location}
                          </p>
                          <p className="text-[10px] font-black text-slate-300">الكمية: {don.quantity} | تاريخ الانتهاء: {don.expiry_date}</p>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                       <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border ${status.color} ${status.border}`}>
                          <status.icon size={14} />
                          {status.label}
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleDelete(don.id)}
                            className="h-10 px-6 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDonations;
