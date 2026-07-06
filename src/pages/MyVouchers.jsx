import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, QrCode, Share2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyVouchers } from '../api';
import { useLang } from '../context/LanguageContext';

const MyVouchers = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleShare = async (v) => {
    const text = `${t('myVouchers.shareTitle')}: ${v.med} — ${v.pharmacy} (${t('myVouchers.shareCode')}: ${v.id})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t('myVouchers.shareTitle'), text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success(t('myVouchers.copySuccess'));
      } else {
        toast.error(t('myVouchers.shareUnsupported'));
      }
    } catch {
      // user cancelled share — ignore
    }
  };

  useEffect(() => {
    getMyVouchers()
      .then(res => {
        setVouchers(res.data);
      })
      .catch(err => {
        toast.error(getApiError(err, t('vouchers.fetchError')));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-4 text-center py-8">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">{t('myVouchers.title')}</h1>
        <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">{t('myVouchers.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {loading ? (
           <div className="col-span-2 text-center py-12 text-slate-400 font-bold">{t('myVouchers.loading')}</div>
        ) : vouchers.length === 0 ? (
           <div className="col-span-2 text-center py-12 text-slate-400 font-bold">{t('myVouchers.empty')}</div>
        ) : vouchers.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden group ${v.status === 'used' ? 'opacity-60 grayscale' : ''}`}
          >
            {/* Voucher Body */}
            <div className="glass-card p-0 flex flex-col md:flex-row min-h-[220px] shadow-2xl overflow-hidden border-2 border-white/50">
               {/* Left Section - Med Info */}
               <div className="bg-primary-950 p-8 text-white flex flex-col justify-between md:w-[65%] text-start relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">{t('myVouchers.couponType')} {v.type}</span>
                        {v.status === 'used' && <span className="text-[10px] font-black text-emerald-400">{t('myVouchers.used')}</span>}
                     </div>
                     <h3 className="text-2xl font-black leading-tight">{v.med}</h3>
                     <div className="space-y-1 text-slate-400">
                        <p className="text-xs font-bold flex items-center gap-2">
                           <MapPin size={12} className="text-primary-500" />
                           {v.pharmacy}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest">{t('myVouchers.validUntil')} {v.expiry}</p>
                     </div>
                  </div>
                  
                  {/* Decorative */}
                  <div className="absolute -bottom-10 -end-10 text-9xl opacity-10 rotate-12 select-none">💊</div>
                  <div className="absolute top-0 start-0 w-full h-full bg-gradient-to-br from-primary-400/10 to-transparent"></div>
               </div>

               {/* Right Section - QR/Auth */}
               <div className="flex-grow p-8 bg-white flex flex-col items-center justify-center gap-4 text-center border-s-2 border-dashed border-slate-100 relative group-hover:bg-slate-50 transition-all">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-950 shadow-inner group-hover:bg-white transition-all">
                     <QrCode size={48} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{v.id}</p>
                     <p className="text-[8px] font-bold text-slate-300">{t('myVouchers.scanCode')}</p>
                  </div>
               </div>

               {/* Serrated Edges */}
               <div className="absolute top-0 end-[-6px] bottom-0 w-3 flex flex-col justify-around py-1">
                  {[...Array(8)].map((_, j) => <div key={j} className="h-2 w-2 rounded-full bg-[#FAF9F6]" />)}
               </div>
            </div>
            
            <div className="flex gap-2 mt-4 justify-end px-2">
               <button onClick={() => handleShare(v)} className="h-10 px-6 rounded-xl bg-white border border-slate-100 text-slate-500 font-bold text-xs hover:bg-white/50 transition-all flex items-center gap-2">
                  <Share2 size={14} /> {t('myVouchers.share')}
               </button>
               <button onClick={() => navigate('/help-center')} className="h-10 px-6 rounded-xl bg-white border border-slate-100 text-slate-500 font-bold text-xs hover:bg-white/50 transition-all flex items-center gap-2">
                  <HelpCircle size={14} /> {t('myVouchers.help')}
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Banner */}
      <section className="mx-4 p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-start gap-4">
         <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle size={24} /></div>
         <div className="text-start space-y-1">
            <h4 className="text-lg font-black text-emerald-950">{t('myVouchers.notFoundTitle')}</h4>
            <p className="text-sm text-emerald-800/70 font-medium leading-relaxed">{t('myVouchers.notFoundDesc')}</p>
         </div>
      </section>
    </div>
  );
};

export default MyVouchers;
