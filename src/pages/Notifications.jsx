import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, AlertTriangle, ShieldCheck, MessageSquare, Trash2, CheckCircle, Info } from 'lucide-react';
import { getMyNotifications, markNotificationsRead, getApiError } from '../api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل الإشعارات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_new: false })));
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحديث الإشعارات'));
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'badge': return Heart;
      default: return Info;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-50 text-emerald-600';
      case 'warning': return 'bg-red-50 text-red-600';
      case 'info': return 'bg-blue-50 text-blue-600';
      case 'badge': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6 px-4">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800">🔔 الإشعارات</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">تابع آخر التحديثات والنشاطات</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="btn-secondary h-12 px-6 text-xs uppercase tracking-widest font-black"
          >
            تعيين الكل كمقروء
          </button>
          <button className="h-12 w-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card group p-6 flex flex-wrap md:flex-nowrap items-center gap-6 cursor-pointer border-transparent hover:border-primary-200 transition-all ${notif.is_new ? 'bg-primary-50/30' : ''}`}
          >
            <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform ${getColor(notif.type)}`}>
               {(() => {
                 const Icon = getIcon(notif.type);
                 return <Icon size={28} />;
               })()}
            </div>
            
            <div className="flex-grow space-y-1 text-right">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-800 text-lg leading-tight">{notif.title}</h3>
                {notif.is_new && (
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">{notif.desc}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.created_at).toLocaleString('ar-EG')}</p>
            </div>

            <div className="flex items-center pr-4">
               <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:text-primary-500 group-hover:bg-primary-50 transition-all">
                 <ShieldCheck size={18} />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 text-center text-slate-300">
        <p className="text-sm font-black uppercase tracking-[0.3em]">نهاية الإشعارات</p>
      </div>
    </div>
  );
};

export default Notifications;
