import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Users, 
  Heart, 
  AlertTriangle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLang } from '../context/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [quickSearch, setQuickSearch] = useState('');

  const handleQuickSearch = () => {
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch)}`);
    } else {
      navigate('/search');
    }
  };
  const stats = [
    { label: t('home.statAvailableLabel'), value: '0', icon: '💊', color: 'text-emerald-600', bg: 'bg-emerald-50', change: t('home.statAvailableChange') },
    { label: t('home.statDonorsLabel'), value: '1', icon: '🤝', color: 'text-amber-600', bg: 'bg-amber-50', change: t('home.statDonorsChange') },
    { label: t('home.statSosLabel'), value: '0', icon: '🚨', color: 'text-red-600', bg: 'bg-red-50', change: t('home.statSosChange') },
    { label: t('home.statBenefitLabel'), value: '0', icon: '❤️', color: 'text-blue-600', bg: 'bg-blue-50', change: t('home.statBenefitChange') },
  ];

  const activities = [];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary-950 p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6 text-start">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md"
          >
            <div className="sos-pulse">
              <span className="sos-pulse-ring bg-emerald-400"></span>
              <span className="sos-pulse-dot bg-emerald-500"></span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">{t('home.badge')}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl font-black leading-[1.1]"
          >
            {t('home.heroTitle1')} <br />
            <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">{t('home.heroTitle2')}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md text-lg font-medium text-slate-400 leading-relaxed"
          >
            {t('home.heroDesc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link to="/donate" className="btn-primary group h-14 px-8 text-lg">
              <PlusCircle className="transition-transform group-hover:rotate-90" />
              {t('home.donateNow')}
            </Link>
            <Link to="/search" className="btn-secondary h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 px-8 text-lg">
              <Search size={22} />
              {t('home.searchMed')}
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]"></div>
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute -bottom-10 left-10 text-[15rem] opacity-5 select-none pointer-events-none">💊</div>
      </section>

      {/* Quick Search Card */}
      <section className="glass-card p-8">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
           {t('home.quickSearchTitle')}
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[300px] relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={t('home.quickSearchPlaceholder')}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
              className="w-full bg-slate-50 border border-slate-200 h-14 ps-12 pe-12 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold"
            />
            <button className="absolute end-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-xl text-xs font-black hover:bg-primary-200 transition-colors">
               {t('home.scan')}
            </button>
          </div>
          <select className="h-14 bg-slate-50 border border-slate-200 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-600 min-w-[160px]">
            <option>{t('home.allGovernorates')}</option>
            <option>{t('home.cairo')}</option>
            <option>{t('home.giza')}</option>
          </select>
          <button onClick={handleQuickSearch} className="btn-primary h-14 px-8 min-w-[120px]">{t('home.searchBtn')}</button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card group relative p-6 transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center gap-4 text-start">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-inner transition-transform group-hover:scale-110 ${stat.bg}`}>
                {stat.icon}
              </div>
              <div className="space-y-1 text-start">
                <h3 className="font-display text-3xl font-black tracking-tight text-slate-800">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-400 leading-none">{stat.label}</p>
              </div>
            </div>
            <div className={`mt-4 text-[10px] font-black uppercase tracking-wider ${stat.color}`}>
              {stat.change}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <section className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-8 pt-10">
              <div className="space-y-1 text-start">
                <h2 className="text-2xl font-black text-slate-800">{t('home.recentActivityTitle')}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('home.recentActivitySub')}</p>
              </div>
              <button className="btn-secondary h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 border-none hover:bg-slate-100">
                {t('home.viewAll')}
              </button>
            </div>
            <div className="divide-y divide-slate-100 p-8 pt-4">
              {activities.length > 0 ? activities.map((activity, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-6 py-6 transition-all hover:bg-slate-50/50 group rounded-2xl px-4 -mx-4 cursor-default text-start"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm group-hover:scale-110 transition-transform ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-grow space-y-1">
                    <p className="text-base text-slate-700 leading-tight">
                      <span className="font-black text-slate-900">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{activity.time}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 rotate-180" />
                </motion.div>
              )) : (
                <div className="p-12 text-center text-slate-400 font-bold">{t('home.noActivities')}</div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          {/* Urgency Card */}
          <section className="glass-card border-none bg-gradient-to-br from-red-600 to-red-800 p-8 text-white shadow-red-200/50">
            <div className="flex items-center gap-4 mb-6 text-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl animate-pulse">
                🚨
              </div>
              <div>
                <h2 className="text-xl font-black">{t('home.urgentTitle')}</h2>
                <p className="text-xs font-bold text-white/60 leading-none">{t('home.urgentSub')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10 text-start">
                <p className="text-sm font-bold mb-1">Insulin Glargine (لانتوس)</p>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">82 {t('home.request')} — 12 {t('home.available')}</span>
                  <span className="text-xs font-black text-red-200">{t('home.veryScarce')}</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '82%' }}
                    className="h-full bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10 text-start">
                <p className="text-sm font-bold mb-1">Glucophage 850mg</p>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">48 {t('home.request')} — 41 {t('home.available')}</span>
                  <span className="text-xs font-black text-amber-200">{t('home.partiallyAvailable')}</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '48%' }}
                    className="h-full bg-amber-400"
                  />
                </div>
              </div>
            </div>
            <Link to="/emergency" className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-white/20">
              {t('home.sosDetails')} <ArrowRight size={16} className="rotate-180" />
            </Link>
          </section>

          {/* Social Proof / Impact */}
          <section className="glass-card p-8 bg-primary-50/50 border-primary-200 text-start">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Heart className="text-primary-600 fill-primary-600/10" size={20} />
              {t('home.impactTitle')}
            </h2>
            <div className="text-center py-4 divide-y divide-primary-100">
               <div className="pb-6">
                  <p className="text-5xl font-display font-black text-primary-700">0</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('home.impactPatients')}</p>
               </div>
               <div className="pt-6">
                  <p className="text-2xl font-display font-black text-slate-700">0 {t('common.currency')}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('home.impactSaved')}</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
