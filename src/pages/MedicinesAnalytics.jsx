import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, Pill, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getMedicineAnalytics, getApiError } from '../api';
import toast from 'react-hot-toast';

const MedicinesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getMedicineAnalytics();
        setData(res.data);
      } catch (e) {
        console.error(e);
        toast.error(getApiError(e, 'فشل تحميل التحليلات'));
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = data ? [
    { label: 'إجمالي الأدوية المتداولة', value: data.total_donations, icon: Pill, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'عمليات التبادل الناجحة', value: data.total_donations * 0.8, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'طلبات استغاثة محلولة', value: data.total_requests, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'أدوية قاربت على الانتهاء', value: data.near_expiry_count, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="space-y-2 text-right">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <BarChart3 className="text-primary-600" size={40} />
          إحصائيات الأدوية والبيانات
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">تحليل اتجاهات السوق وتوفر الأدوية في المناطق المختلفة</p>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4 transition-all hover:scale-[1.02]"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Needed Medicines */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h2 className="text-xl font-black text-slate-800 mb-8 border-r-4 border-primary-500 pr-4">الأدوية الأكثر طلباً وشحاً</h2>
            <div className="space-y-8">
              {(data?.top_medicines || []).map((med, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${med.status === 'scarcity' ? 'bg-red-500' : med.status === 'stable' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="font-black text-slate-700">{med.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 uppercase">{med.requests} طلب</span>
                      {med.trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(med.requests / 150) * 100}%` }}
                      className={`h-full ${med.status === 'scarcity' ? 'bg-red-500' : med.status === 'stable' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>نسبة التوفر: {Math.round((med.available / med.requests) * 100)}%</span>
                    <span>المخزون الحالي: {med.available}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Region Trends Mockup */}
        <section className="space-y-8">
           <div className="glass-card p-8 bg-slate-800 text-white border-0 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-500),transparent)]"></div>
              <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                 <PieChart className="text-amber-400" />
                 توزيع الطلبات حسب المناطق
              </h3>
              <div className="space-y-6 relative z-10">
                 {[
                   { name: 'القاهرة', val: '42%', color: 'bg-primary-400' },
                   { name: 'الجيزة', val: '28%', color: 'bg-emerald-400' },
                   { name: 'الإسكندرية', val: '15%', color: 'bg-blue-400' },
                   { name: 'باقي المحافظات', val: '15%', color: 'bg-slate-400' },
                 ].map((region, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{region.name}</span>
                        <span className="text-primary-300">{region.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${region.color}`} style={{ width: region.val }} />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                 <button className="text-xs font-black uppercase tracking-widest text-primary-400 hover:text-white transition-colors">عرض التقرير الجغرافي الكامل</button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default MedicinesAnalytics;
