import { Settings as SettingsIcon, Bell, Shield, Lock, Globe, Smartphone, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: t('settings.tabGeneral'), icon: SettingsIcon },
    { id: 'notifications', label: t('settings.tabNotifications'), icon: Bell },
    { id: 'security', label: t('settings.tabSecurity'), icon: Shield },
  ];

  const [notifs, setNotifs] = useState([
    { id: 'new_pharmacy', title: t('settings.notifNewPharmacyTitle'), desc: t('settings.notifNewPharmacyDesc'), enabled: true },
    { id: 'reports', title: t('settings.notifReportsTitle'), desc: t('settings.notifReportsDesc'), enabled: true },
    { id: 'sos', title: t('settings.adminNotifSosTitle'), desc: t('settings.adminNotifSosDesc'), enabled: false },
  ]);

  const toggleNotif = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1 text-start">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <SettingsIcon className="text-red-400" size={34} />
          {t('settings.title')}
        </h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold transition-all text-start text-sm ${
                activeTab === tab.id
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-slate-900 border border-white/5 rounded-2xl p-8 space-y-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Admin Info */}
              <section className="space-y-4">
                <h3 className="text-base font-black text-white border-s-4 border-red-500 ps-3">{t('settings.adminInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('settings.fullName')}</label>
                    <input
                      type="text"
                      defaultValue={user?.full_name || ''}
                      className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('settings.email')}</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => toast.success(t('settings.saveSuccess'))}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                >
                  <Save size={15} /> {t('settings.saveChanges')}
                </button>
              </section>

              <div className="h-px bg-white/5" />

              {/* Language */}
              <section className="space-y-4">
                <h3 className="text-base font-black text-white border-s-4 border-red-500 ps-3">{t('settings.langRegion')}</h3>
                <div className="max-w-xs">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t('settings.systemLang')}</label>
                  <select className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 text-sm">
                    <option>{t('settings.langArabic')}</option>
                    <option>{t('settings.langEnglish')}</option>
                  </select>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-base font-black text-white border-s-4 border-red-500 ps-3">{t('settings.notifPrefs')}</h3>
              <div className="space-y-3">
                {notifs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-all">
                    <div className="text-start flex-grow">
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotif(item.id)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 me-4 ${item.enabled ? 'bg-red-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${item.enabled ? 'end-1' : 'start-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast.success(t('settings.savePrefsSuccess'))}
                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
              >
                <Save size={15} /> {t('settings.savePrefs')}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <section className="space-y-4">
                <h3 className="text-base font-black text-white border-s-4 border-red-500 ps-3">{t('settings.changePassword')}</h3>
                <div className="space-y-3 max-w-md">
                  <input
                    type="password"
                    placeholder={t('settings.currentPassword')}
                    className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-slate-600"
                  />
                  <input
                    type="password"
                    placeholder={t('settings.newPassword')}
                    className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-slate-600"
                  />
                  <input
                    type="password"
                    placeholder={t('settings.confirmNewPassword')}
                    className="w-full bg-slate-800 border border-white/5 h-12 px-4 rounded-xl font-bold text-white outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-slate-600"
                  />
                  <button
                    onClick={() => toast.success(t('settings.passwordUpdated'))}
                    className="flex items-center gap-2 h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                  >
                    <Lock size={15} /> {t('settings.updatePassword')}
                  </button>
                </div>
              </section>

              <div className="h-px bg-white/5" />

              {/* Danger Zone */}
              <section className="space-y-4">
                <h3 className="text-base font-black text-red-400">{t('settings.dangerZone')}</h3>
                <div className="p-6 rounded-xl border-2 border-dashed border-red-500/20 bg-red-500/5 text-start space-y-3">
                  <h4 className="text-white font-black">{t('settings.disableSystem')}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {t('settings.disableSystemDesc')}
                  </p>
                  <button
                    onClick={() => toast.error(t('settings.notAvailableProd'))}
                    className="h-10 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={14} /> {t('settings.tempDisable')}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
