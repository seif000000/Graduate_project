import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Eye, Lock, Globe, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { lang, setLang, t } = useLang();

  const tabs = [
    { id: 'general', label: t('settings.tabGeneral'), icon: SettingsIcon },
    { id: 'notifications', label: t('settings.tabNotifications'), icon: Bell },
    { id: 'privacy', label: t('settings.tabPrivacy'), icon: Shield },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2 text-start">
        <h1 className="text-4xl font-black text-slate-800">{t('settings.pageTitle')}</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('settings.pageSub')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-start ${
                activeTab === tab.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 space-y-10"
          >
            {activeTab === 'general' && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">{t('settings.languageRegion')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ps-2">{t('settings.appLanguage')}</label>
                      <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold text-slate-700 outline-none focus:border-primary-500"
                      >
                        <option value="ar">{t('settings.arabic')}</option>
                        <option value="en">{t('settings.english')}</option>
                      </select>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">{t('settings.changePassword')}</h3>
                  <div className="space-y-4 max-w-md">
                    <input type="password" placeholder={t('settings.currentPassword')} className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500" />
                    <input type="password" placeholder={t('settings.newPassword')} className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500" />
                    <button
                      onClick={() => toast.success(t('settings.passwordUpdated'))}
                      className="btn-primary h-14 px-8 mt-2"
                    >
                      {t('settings.updatePassword')}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">{t('settings.notifPrefs')}</h3>
                  <div className="space-y-4">
                    {[
                      { title: t('settings.notifMedTitle'), desc: t('settings.notifMedDesc'), icon: Smartphone, enabled: true },
                      { title: t('settings.notifSosTitle'), desc: t('settings.notifSosDesc'), icon: Bell, enabled: true },
                      { title: t('settings.notifMsgTitle'), desc: t('settings.notifMsgDesc'), icon: Globe, enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm"><item.icon size={20} /></div>
                          <div className="text-start">
                            <p className="font-bold text-slate-800">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.desc}</p>
                          </div>
                        </div>
                        <div className={`w-14 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center px-1 ${item.enabled ? 'bg-primary-500 border-primary-500 justify-end' : 'bg-slate-200 border-slate-200 justify-start'}`}>
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 text-start">{t('settings.privacySecurity')}</h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl border border-amber-100 bg-amber-50/50 flex items-start gap-4">
                      <Lock className="text-amber-600 shrink-0" size={20} />
                      <div className="text-start">
                        <p className="font-bold text-amber-900">{t('settings.profileVisibility')}</p>
                        <p className="text-xs text-amber-700/70 font-medium leading-relaxed">{t('settings.profileVisibilityDesc')}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-red-600">{t('settings.dangerZone')}</h3>
                  <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-red-100 bg-red-50/30 text-center space-y-4">
                    <h4 className="text-red-900 font-black">{t('settings.deleteAccount')}</h4>
                    <p className="text-xs text-red-700 font-medium max-w-md mx-auto">{t('settings.deleteAccountDesc')}</p>
                    <button
                      onClick={() => toast.error(t('settings.deleteUnavailable'))}
                      className="h-14 px-8 rounded-2xl bg-red-600 text-white font-black text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-3 mx-auto mt-4"
                    >
                      <Trash2 size={18} />
                      {t('settings.deleteNow')}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
