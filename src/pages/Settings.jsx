import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Eye, Lock, Globe, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'إعدادات عامة', icon: SettingsIcon },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'privacy', label: 'الخصوصية والأمان', icon: Shield },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="space-y-2 text-right">
        <h1 className="text-4xl font-black text-slate-800">⚙️ الإعدادات</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">تخصيص تجربتك وحماية خصوصيتك</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-right ${
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
                  <h3 className="text-lg font-black text-slate-800">اللغة والمنطقة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">لغة التطبيق</label>
                      <select className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold text-slate-700 outline-none focus:border-primary-500">
                        <option>العربية (الافتراضية)</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">تغيير كلمة المرور</h3>
                  <div className="space-y-4 max-w-md">
                    <input type="password" placeholder="كلمة المرور الحالية" className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500" />
                    <input type="password" placeholder="كلمة المرور الجديدة" className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl font-bold outline-none focus:border-primary-500" />
                    <button 
                      onClick={() => toast.success('تم تحديث كلمة المرور بنجاح! 🔐')}
                      className="btn-primary h-14 px-8 mt-2"
                    >
                      تحديث كلمة المرور
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">تفضيلات الإشعارات</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'إشعارات الأدوية المتاحة', desc: 'عند إضافة دواء جديد يطابق اهتماماتك', icon: Smartphone, enabled: true },
                      { title: 'تنبيهات الاستغاثة', desc: 'عند وجود طلب استغاثة عاجل في منطقتك', icon: Bell, enabled: true },
                      { title: 'رسائل التواصل', desc: 'عندما يرسل لك أحد المستخدمين رسالة', icon: Globe, enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm"><item.icon size={20} /></div>
                          <div className="text-right">
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
                  <h3 className="text-lg font-black text-slate-800 text-right">الخصوصية والأمان</h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl border border-amber-100 bg-amber-50/50 flex items-start gap-4">
                      <Lock className="text-amber-600 shrink-0" size={20} />
                      <div className="text-right">
                        <p className="font-bold text-amber-900">ظهور الملف الشخصي</p>
                        <p className="text-xs text-amber-700/70 font-medium leading-relaxed">بإيقاف هذا الخيار، لن يتمكن الآخرون من رؤية قائمة تبرعاتك السابقة أو شاراتك.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-red-600">منطقة الخطر</h3>
                  <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-red-100 bg-red-50/30 text-center space-y-4">
                    <h4 className="text-red-900 font-black">حذف الحساب نهائياً</h4>
                    <p className="text-xs text-red-700 font-medium max-w-md mx-auto">بمجرد حذف الحساب، سيتم مسح كافة بياناتك وسجل تبرعاتك. هذا الإجراء غير قابل للتراجع.</p>
                    <button 
                      onClick={() => toast.error('هذا الإجراء غير متاح حالياً لدواعي الأمان ⚠️')}
                      className="h-14 px-8 rounded-2xl bg-red-600 text-white font-black text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-3 mx-auto mt-4"
                    >
                      <Trash2 size={18} />
                      حذف حسابي الآن
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
