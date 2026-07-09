import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListChecks, AlertTriangle, Clock, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import { getNearExpiry, getApiError } from '../api';
import { downloadCsv } from '../utils/downloadCsv';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const NearExpiry = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDownloadReport = () => {
    if (medicines.length === 0) {
      toast.error(t('nearExpiry.noMedsToExport'));
      return;
    }
    downloadCsv(
      'near-expiry-report.csv',
      medicines.map((m) => ({
        medicine_name: m.medicine_name,
        generic_name: m.generic_name,
        quantity: m.quantity,
        expiry_date: m.expiry_date,
        batch_info: m.batch_info || '',
      })),
      [
        { key: 'medicine_name', label: t('nearExpiry.csvName') },
        { key: 'generic_name', label: t('nearExpiry.csvGeneric') },
        { key: 'quantity', label: t('nearExpiry.csvQuantity') },
        { key: 'expiry_date', label: t('nearExpiry.csvExpiry') },
        { key: 'batch_info', label: t('nearExpiry.csvBatch') },
      ]
    );
    toast.success(t('nearExpiry.reportDownloaded'));
  };

  useEffect(() => {
    const fetchNearExpiry = async () => {
      try {
        const response = await getNearExpiry();
        setMedicines(response.data);
      } catch (error) {
        toast.error(getApiError(error, t('nearExpiry.fetchError')));
      } finally {
        setLoading(false);
      }
    };
    fetchNearExpiry();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
             <ListChecks className="text-amber-500" size={40} />
             {t('nearExpiry.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('nearExpiry.subtitle')}</p>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
         <div className="flex gap-4 items-start max-w-2xl text-start">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
               <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
               <h3 className="text-lg font-black text-amber-900">{t('nearExpiry.alertTitle')}</h3>
               <p className="text-sm text-amber-700/70 font-medium">{t('nearExpiry.alertBody')}</p>
            </div>
         </div>
         <button onClick={handleDownloadReport} className="h-14 px-10 rounded-2xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30">{t('nearExpiry.downloadReport')}</button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : medicines.length === 0 ? (
        <div className="glass-card p-16 text-center text-slate-400 font-bold space-y-4">
           <div className="text-5xl">✅</div>
           <p>{t('nearExpiry.emptyState')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {medicines.map((med) => (
             <motion.div 
               key={med.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card p-0 overflow-hidden group hover:border-amber-200 transition-all"
             >
                <div className="p-6 space-y-4">
                   <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                         <Clock size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 italic">{t('nearExpiry.expiresSoon')}</span>
                   </div>

                   <div className="text-start space-y-1">
                      <h4 className="text-xl font-black text-slate-800">{med.medicine_name}</h4>
                      <p className="text-xs font-bold text-slate-400 underline decoration-cyan-200">{med.generic_name}</p>
                   </div>

                   <div className="flex gap-4 pt-4 border-t border-slate-50">
                      <div className="flex-grow text-start">
                         <p className="text-[10px] font-black text-slate-300 uppercase mb-1">{t('nearExpiry.colExpiry')}</p>
                         <p className="text-sm font-black text-red-500 flex items-center gap-2">
                            <Calendar size={14} />
                            {med.expiry_date}
                         </p>
                      </div>
                      <div className="text-end">
                         <p className="text-[10px] font-black text-slate-300 uppercase mb-1">{t('nearExpiry.colQuantity')}</p>
                         <p className="text-sm font-black text-slate-800">{med.quantity}</p>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                   <button
                      onClick={() => navigate('/emergency')}
                      className="flex-grow h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 transition-all flex items-center justify-center gap-2"
                   >
                      <MessageCircle size={16} />
                      {t('nearExpiry.viewRequests')}
                   </button>
                   <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(med.medicine_name || '')}`)}
                      title={t('nearExpiry.viewInSearch')}
                      className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                   >
                      <ArrowLeft size={18} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default NearExpiry;
