import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users, Pill, Activity, BarChart3, ArrowUpRight, CheckCircle } from 'lucide-react';
import { getPharmacyStats, getApiError } from '../api';
import { downloadCsv } from '../utils/downloadCsv';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const PharmacyStats = () => {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadReport = () => {
    if (!data) {
      toast.error(t('stats.noDataToExport'));
      return;
    }
    downloadCsv(
      'pharmacy-stats.csv',
      [
        { metric: t('stats.dispensed'), value: data.total_dispensed ?? 0 },
        { metric: t('stats.available'), value: data.total_available ?? 0 },
        { metric: t('stats.totalItems'), value: data.total_items ?? 0 },
        { metric: t('stats.completionRatePct'), value: data.completion_rate ?? 0 },
      ],
      [
        { key: 'metric', label: t('stats.csvMetric') },
        { key: 'value', label: t('stats.csvValue') },
      ]
    );
    toast.success(t('stats.reportDownloaded'));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPharmacyStats();
        setData(res.data);
      } catch (e) {
        toast.error(getApiError(e, t('analytics.fetchError')));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: t('stats.dispensed'), value: data?.total_dispensed || '0', icon: Pill, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: t('stats.available'), value: data?.total_available || '0', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('stats.totalItems'), value: data?.total_items || '0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('stats.completionRate'), value: `${data?.completion_rate || '0'}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2 text-start border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <TrendingUp className="text-blue-600" size={40} />
          {t('stats.title')}
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('stats.subtitle')}</p>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur-md border border-white shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl p-6 flex flex-col gap-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="text-start">
              <h3 className="text-3xl font-black text-slate-800 leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Mockup */}
        <section className="lg:col-span-2 space-y-6">
           <div className="bg-white/70 backdrop-blur-md border border-white shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl p-10 h-full">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-xl font-black text-slate-800 border-s-4 border-blue-500 ps-6">{t('stats.chartTitle')}</h2>
                 <span className="px-4 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase border border-amber-100">{t('stats.demoData')}</span>
              </div>
              
              <div className="flex items-end justify-between h-64 gap-6 px-4">
                 {[40, 60, 45, 80, 55, 90, 70, 85, 60, 100, 75, 95].map((val, i) => (
                   <div key={i} className="flex-grow flex flex-col items-center gap-4">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl group relative cursor-pointer hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-shadow"
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val} {t('stats.unit')}
                         </div>
                      </motion.div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{i + 1}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Top Activity / Vouchers */}
        <section className="space-y-6">
           <div className="bg-gradient-to-br from-blue-950 to-cyan-950 text-white rounded-3xl p-8 border border-white/10 overflow-hidden relative shadow-[0_15px_40px_rgba(14,165,233,0.2)]">
              <div className="relative z-10 space-y-6 text-start">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">🎟️</div>
                 <h3 className="text-xl font-black tracking-tight leading-tight">{t('stats.vouchersTitle')}</h3>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs font-bold text-white/50 leading-relaxed">{t('stats.vouchersEmpty')}</p>
                 </div>
                 <button onClick={handleDownloadReport} className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] border border-white/10 rounded-2xl hover:bg-white/5 transition-all">{t('stats.downloadReport')}</button>
              </div>
           </div>

           <div className="bg-white/60 backdrop-blur-md p-8 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border border-white rounded-3xl shadow-[0_8px_30px_rgba(14,165,233,0.05)]">
              <h4 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> {t('stats.ratingTitle')}
              </h4>
              <p className="text-4xl font-display font-black text-blue-600 my-4">{data?.rating ? `${data.rating}` : '—'} <span className="text-lg text-blue-400">/ 5</span></p>
              <p className="text-xs text-blue-700/60 font-medium leading-relaxed">{data?.rating_count ? `${t('stats.ratingCountPrefix')} ${data.rating_count} ${t('stats.ratingCountSuffix')}` : t('stats.ratingEmpty')}</p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default PharmacyStats;
