import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Pill, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { getMedicineAnalytics, getApiError } from '../api';
import toast from 'react-hot-toast';

const MedicinesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
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

  useEffect(() => { fetchAnalytics(); }, []);

  const stats = data ? [
    { label: 'إجمالي الأدوية المتداولة', value: data.total_donations ?? 0, icon: Pill, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'طلبات الاستغاثة', value: data.total_requests ?? 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'نسبة النجاح', value: `${data.success_rate ?? 0}%`, icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'أدوية قاربت الانتهاء', value: data.near_expiry_count ?? 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ] : [];

  const regions = [
    { name: 'القاهرة', val: 42, color: 'bg-red-500' },
    { name: 'الجيزة', val: 28, color: 'bg-blue-500' },
    { name: 'الإسكندرية', val: 15, color: 'bg-emerald-500' },
    { name: 'باقي المحافظات', val: 15, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex items-center justify-between">
        <div className="space-y-1 text-right">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BarChart3 className="text-red-400" size={34} />
            إحصائيات الأدوية والبيانات
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            تحليل اتجاهات توفر الأدوية وطلبات المجتمع
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4" />
              <div className="h-7 bg-slate-800 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-32" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className={`bg-slate-900 border ${stat.border} rounded-2xl p-6 flex items-center gap-4 hover:border-white/10 transition-all`}>
              <div className={`w-13 h-13 p-3.5 rounded-xl ${stat.bg} border ${stat.border} shrink-0`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className="text-right">
                <h3 className={`text-2xl font-black ${stat.color} leading-none mb-1`}>{stat.value}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Medicines */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-8">
          <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 border-r-4 border-red-500 pr-4">
            الأدوية الأكثر طلباً وشحاً
          </h2>
          {loading ? (
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-2 bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (data?.top_medicines || []).length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">لا توجد بيانات متاحة</p>
          ) : (
            <div className="space-y-6">
              {(data?.top_medicines || []).map((med, i) => {
                const statusColor = med.status === 'scarcity' ? 'bg-red-500' : med.status === 'stable' ? 'bg-amber-500' : 'bg-emerald-500';
                const pct = Math.min(100, Math.round((med.requests / 150) * 100));
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="font-black text-white text-sm">{med.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">{med.requests} طلب</span>
                        {med.trend === 'up'
                          ? <ArrowUpRight size={13} className="text-emerald-400" />
                          : <ArrowDownRight size={13} className="text-red-400" />
                        }
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${statusColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <span>نسبة التوفر: {Math.round((med.available / med.requests) * 100)}%</span>
                      <span>المخزون: {med.available}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Region Breakdown */}
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_top_right,var(--color-red-500),transparent)]" />
          <h3 className="text-base font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <PieChart className="text-amber-400" size={18} />
            توزيع الطلبات حسب المناطق
          </h3>
          <div className="space-y-5 relative z-10">
            {regions.map((region, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{region.name}</span>
                  <span className="text-slate-400">{region.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${region.color} rounded-full`} style={{ width: `${region.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <button className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-white transition-colors">
              عرض التقرير الجغرافي الكامل ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinesAnalytics;
