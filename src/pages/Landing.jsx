import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Search, PlusCircle, Building2, Shield, Bot,
  LogIn, UserPlus, ArrowLeft, Pill, MapPin, AlertCircle
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const features = [
  { icon: Search, titleKey: 'landing.feature.search.title', descKey: 'landing.feature.search.desc' },
  { icon: PlusCircle, titleKey: 'landing.feature.donate.title', descKey: 'landing.feature.donate.desc' },
  { icon: AlertCircle, titleKey: 'landing.feature.urgent.title', descKey: 'landing.feature.urgent.desc' },
  { icon: Bot, titleKey: 'landing.feature.assistant.title', descKey: 'landing.feature.assistant.desc' },
];

const roles = [
  {
    icon: Heart,
    titleKey: 'landing.role.user.title',
    descKey: 'landing.role.user.desc',
    loginHint: 'user',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Building2,
    titleKey: 'landing.role.pharmacy.title',
    descKey: 'landing.role.pharmacy.desc',
    loginHint: 'pharmacy',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Shield,
    titleKey: 'landing.role.admin.title',
    descKey: 'landing.role.admin.desc',
    loginHint: 'admin',
    color: 'from-slate-700 to-slate-900',
  },
];

const Landing = () => {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
              🏥
            </div>
            <span className="text-xl font-black text-slate-800">{t('common.appName')}</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="h-10 px-4 sm:px-6 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">{t('landing.login')}</span>
            </Link>
            <Link
              to="/register"
              className="h-10 px-4 sm:px-6 rounded-xl bg-primary-600 text-white text-sm font-black hover:bg-primary-700 transition-all flex items-center gap-2 shadow-md"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">{t('landing.register')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6 text-start"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-xs font-black text-primary-700">
              {t('landing.heroBadge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
              {t('landing.heroTitleLine1')}
              <br />
              <span className="text-primary-600">{t('landing.heroTitleLine2')}</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              {t('landing.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register" className="btn-primary h-14 px-8 text-base">
                <UserPlus size={20} />
                {t('landing.startFree')}
              </Link>
              <Link to="/login" className="btn-secondary h-14 px-8 text-base border-slate-200">
                <LogIn size={20} />
                {t('landing.haveAccount')}
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl pointer-events-none" />
      </section>

      {/* Who are you */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-slate-800 text-center mb-2">{t('landing.whoTitle')}</h2>
        <p className="text-slate-400 font-bold text-center text-sm mb-10">
          {t('landing.whoDesc')}
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={r.titleKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 text-start space-y-4 hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white shadow-lg`}>
                <r.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800">{t(r.titleKey)}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{t(r.descKey)}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-black text-primary-600 hover:text-primary-700"
              >
                {t('landing.login')}
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features preview */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-10">{t('landing.whatTitle')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.titleKey} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <f.icon size={24} />
                </div>
                <h3 className="font-black text-slate-800 mb-2">{t(f.titleKey)}</h3>
                <p className="text-xs font-medium text-slate-500">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-bold text-slate-400 mt-10 flex items-center justify-center gap-2">
            <MapPin size={16} className="text-primary-500" />
            {t('landing.servicesNote')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">{t('landing.ctaTitle')}</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
          {t('landing.ctaDesc')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary h-14 px-10">
            {t('landing.createNewAccount')}
          </Link>
          <Link to="/login" className="btn-secondary h-14 px-10">
            {t('landing.login')}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest flex flex-col gap-2 items-center">
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-primary-600 transition-colors">{t('landing.footerAbout')}</Link>
          <Link to="/login" className="hover:text-primary-600 transition-colors">{t('landing.login')}</Link>
          <Link to="/register" className="hover:text-primary-600 transition-colors">{t('landing.register')}</Link>
        </div>
        <span>{t('landing.footerCopyright')} &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

export default Landing;
