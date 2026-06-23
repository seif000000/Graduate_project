import { useState, useEffect } from 'react';
import { AlertCircle, MessageCircle, MoreVertical, CheckCircle, ShieldAlert, UserX, Clock, RefreshCw, Inbox } from 'lucide-react';
import { getAdminReports, getApiError } from '../api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports();
      setReports(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل البلاغات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const getPriorityBadge = (p) => {
    switch(p) {
      case 'high': return <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-full tracking-wider">🔴 عاجل</span>;
      case 'medium': return <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded-full tracking-wider">🟡 متوسط</span>;
      case 'low': return <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full tracking-wider">🔵 منخفض</span>;
      default: return <span className="px-2.5 py-1 bg-slate-700 text-slate-400 text-[10px] font-black uppercase rounded-full tracking-wider">غير محدد</span>;
    }
  };

  const openCount = reports.filter(r => r.status === 'open').length;
  const investigatingCount = reports.filter(r => r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex items-center justify-between">
        <div className="space-y-1 text-right">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="text-red-400" size={34} />
            سجلات النظام والشكاوى
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            مراجعة بلاغات المستخدمين وحل النزاعات التقنية والسلوكية
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-right">
          <p className="text-3xl font-black text-red-400">{loading ? '—' : openCount}</p>
          <p className="text-[10px] text-red-400/60 font-black uppercase tracking-wider mt-1">بلاغات مفتوحة</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-right">
          <p className="text-3xl font-black text-amber-400">{loading ? '—' : investigatingCount}</p>
          <p className="text-[10px] text-amber-400/60 font-black uppercase tracking-wider mt-1">قيد التحقيق</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-right">
          <p className="text-3xl font-black text-emerald-400">{loading ? '—' : resolvedCount}</p>
          <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-wider mt-1">تم حلها</p>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-8 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-20 text-center">
          <Inbox size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-400 mb-2">لا توجد بلاغات مسجّلة</h3>
          <p className="text-sm text-slate-600">ستظهر هنا شكاوى المستخدمين فور وصولها.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`bg-slate-900 border rounded-2xl p-6 transition-all hover:border-white/10 ${
                report.status === 'open' ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-white/5'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-3 flex-grow text-right">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getPriorityBadge(report.priority)}
                    <h3 className="text-lg font-black text-white">{report.subject}</h3>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">{report.description}</p>
                  <div className="flex items-center gap-5 pt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <MessageCircle size={12} />
                      مستخدم #{report.user_id}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <Clock size={12} />
                      {new Date(report.created_at).toLocaleString('ar-EG')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-wider">
                      <AlertCircle size={12} />
                      {report.type === 'medicine' ? 'شكوى دواء' : report.type === 'user' ? 'شكوى مستخدم' : 'شكوى تقنية'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => toast.success('تم تحديد البلاغ كمحلول')}
                    className="h-10 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={15} /> حل المشكلة
                  </button>
                  <button
                    onClick={() => toast.error('تم حظر المستخدم')}
                    className="h-10 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <UserX size={15} /> حظر المستخدم
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center hover:bg-white/10 transition-all self-end">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
