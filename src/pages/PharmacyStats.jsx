import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users, Pill, Activity, BarChart3, ArrowUpRight, CheckCircle } from 'lucide-react';
import { getPharmacyStats } from '../api';

const PharmacyStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPharmacyStats();
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'أدوية تم صرفها', value: data?.total_dispensed || '0', icon: Pill, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'أدوية متاحة الآن', value: data?.total_available || '0', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'إجمالي العناصر', value: data?.total_items || '0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'نسبة الإنجاز', value: `${data?.completion_rate || '0'}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="space-y-2 text-right">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <TrendingUp className="text-primary-600" size={40} />
          إحصائيات الصيدلية
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">متابعة أداء الصيدلية وتأثيرها المجتمعي في مسند</p>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="text-right">
              <h3 className="text-3xl font-black text-slate-800 leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                 <ArrowUpRight size={12} /> +12% هذا الشهر
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Mockup */}
        <section className="lg:col-span-2 space-y-6">
           <div className="glass-card p-10 h-full">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-xl font-black text-slate-800 border-r-4 border-primary-500 pr-6">مخطط صرف الأدوية الشهري</h2>
                 <div className="flex gap-2">
                    <span className="px-4 py-1 bg-primary-100 text-primary-700 text-[10px] font-black rounded-full uppercase">العام الحالي</span>
                    <span className="px-4 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase">العام الماضي</span>
                 </div>
              </div>
              
              <div className="flex items-end justify-between h-64 gap-6 px-4">
                 {[40, 60, 45, 80, 55, 90, 70, 85, 60, 100, 75, 95].map((val, i) => (
                   <div key={i} className="flex-grow flex flex-col items-center gap-4">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-xl group relative cursor-pointer"
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val} وحدة
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
           <div className="glass-card p-8 bg-primary-950 text-white border-0 overflow-hidden relative">
              <div className="relative z-10 space-y-6 text-right">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🎟️</div>
                 <h3 className="text-xl font-black tracking-tight leading-tight">الكوبونات التي تمت معالجتها مؤخراً</h3>
                 <div className="space-y-4">
                    {[
                      { user: 'مريم علي', code: 'MS-892', time: '10:30 ص' },
                      { user: 'خالد رمضان', code: 'MS-714', time: 'أمس' },
                      { user: 'فاطمة بكر', code: 'MS-552', time: 'أمس' }
                    ].map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                         <div className="text-right">
                            <p className="text-xs font-black">{v.user}</p>
                            <p className="text-[10px] text-primary-400 font-bold tracking-widest uppercase">{v.code}</p>
                         </div>
                         <span className="text-[9px] font-bold text-white/40">{v.time}</span>
                      </div>
                    ))}
                 </div>
                 <button className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] border border-white/10 rounded-2xl hover:bg-white/5 transition-all">تنزيل التقرير الكامل</button>
              </div>
           </div>

           <div className="glass-card p-8 bg-emerald-50/50 border-emerald-100">
              <h4 className="text-sm font-black text-emerald-900 mb-2 flex items-center gap-2">
                <Activity size={18} /> التقييم العام
              </h4>
              <p className="text-3xl font-display font-black text-emerald-600">4.9 / 5</p>
              <p className="text-xs text-emerald-700/60 font-medium leading-relaxed mt-2">بناءً على 124 تقييم من المستفيدين هذا العام.</p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default PharmacyStats;
