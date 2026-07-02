import { useState, useEffect } from 'react';
import { AlertCircle, MessageCircle, MoreVertical, CheckCircle, ShieldAlert, UserX, Clock, RefreshCw, Inbox } from 'lucide-react';
import { getAdminReports, resolveReport, banUser, getApiError } from '../api';
import { formatDateTime } from '../utils/formatDate';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Reports = () => {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports();
      setReports(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, t('reports.loadFailed')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolve = async (report) => {
    try {
      await resolveReport(report.id, 'resolved');
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r));
      toast.success(t('reports.resolveSuccess'));
    } catch (e) {
      toast.error(getApiError(e, t('reports.resolveFailed')));
    }
  };

  const handleBan = async (report) => {
    if (!window.confirm(t('reports.confirmBan').replace('{id}', report.user_id))) return;
    try {
      await banUser(report.user_id);
      toast.success(t('reports.banSuccess'));
    } catch (e) {
      toast.error(getApiError(e, t('reports.banFailed')));
    }
  };

  const getPriorityBadge = (p) => {
    switch(p) {
      case 'high': return <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-full tracking-wider">{t('reports.priorityHigh')}</span>;
      case 'medium': return <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded-full tracking-wider">{t('reports.priorityMedium')}</span>;
      case 'low': return <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full tracking-wider">{t('reports.priorityLow')}</span>;
      default: return <span className="px-2.5 py-1 bg-slate-700 text-slate-400 text-[10px] font-black uppercase rounded-full tracking-wider">{t('reports.priorityUnknown')}</span>;
    }
  };

  const openCount = reports.filter(r => r.status === 'open').length;
  const investigatingCount = reports.filter(r => r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div className="space-y-1 text-start">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="text-red-400" size={34} />
            {t('reports.title')}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {t('reports.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {t('reports.refresh')}
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-start">
          <p className="text-3xl font-black text-red-400">{loading ? '—' : openCount}</p>
          <p className="text-[10px] text-red-400/60 font-black uppercase tracking-wider mt-1">{t('reports.statOpen')}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-start">
          <p className="text-3xl font-black text-amber-400">{loading ? '—' : investigatingCount}</p>
          <p className="text-[10px] text-amber-400/60 font-black uppercase tracking-wider mt-1">{t('reports.statInvestigating')}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-start">
          <p className="text-3xl font-black text-emerald-400">{loading ? '—' : resolvedCount}</p>
          <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-wider mt-1">{t('reports.statResolved')}</p>
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
          <h3 className="text-lg font-black text-slate-400 mb-2">{t('reports.emptyTitle')}</h3>
          <p className="text-sm text-slate-600">{t('reports.emptySubtitle')}</p>
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
                <div className="space-y-3 flex-grow text-start">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getPriorityBadge(report.priority)}
                    <h3 className="text-lg font-black text-white">{report.subject}</h3>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">{report.description}</p>
                  <div className="flex items-center gap-5 pt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <MessageCircle size={12} />
                      {t('reports.userLabel').replace('{id}', report.user_id)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <Clock size={12} />
                      {formatDateTime(report.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-wider">
                      <AlertCircle size={12} />
                      {report.type === 'medicine' ? t('reports.typeMedicine') : report.type === 'user' ? t('reports.typeUser') : t('reports.typeTechnical')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(report)}
                      className="h-10 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={15} /> {t('reports.resolve')}
                    </button>
                  )}
                  <button
                    onClick={() => handleBan(report)}
                    className="h-10 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <UserX size={15} /> {t('reports.banUser')}
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
