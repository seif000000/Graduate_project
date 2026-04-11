import { motion } from 'framer-motion';
import { 
  Trophy, 
  Heart, 
  Users, 
  ArrowUpRight, 
  Clock, 
  Star, 
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'إجمالي التبرعات', value: '0', icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'أرواح ساعدتها', value: '0', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'طلبات استغاثة', value: '0', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مستوى الثقة', value: '%100', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const recentHistory = [];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Profile Summary Card */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
           <div className="flex items-center gap-8 text-right">
              <div className="relative">
                 <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl font-black border-4 border-white/10">أح</div>
              </div>
               <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight">أهلاً بك، {JSON.parse(localStorage.getItem('user'))?.full_name || 'أحمد محمود'} 👋</h1>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">أنت عضو في "مسند" منذ {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                  <div className="flex gap-3 pt-3">
                     <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black tracking-widest uppercase">عضو موثق ✅</span>
                  </div>
               </div>
           </div>
           
        </div>

        {/* Decor */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-5 select-none pointer-events-none">⭐</div>
      </section>

      {/* Stats Quickbar */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass-card p-6 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-2xl hover:bg-white"
           >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl`}>
                 <stat.icon size={24} />
              </div>
              <div className="text-right">
                 <h3 className="text-2xl font-black text-slate-800 leading-none">{stat.value}</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
           </motion.div>
         ))}
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* History */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between text-right pr-2">
               <h3 className="text-xl font-black text-slate-800">سجل النشاطات</h3>
               <button className="text-primary-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">عرض الكل <ChevronRight size={14} className="rotate-180" /></button>
            </div>
            
             <div className="glass-card overflow-hidden">
                <div className="divide-y divide-slate-50">
                   {recentHistory.length > 0 ? recentHistory.map((item, i) => (
                     <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-4 text-right">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${item.type === 'تبرع' ? 'bg-primary-50 text-primary-600' : 'bg-blue-50 text-blue-600'}`}>
                              {item.type === 'تبرع' ? '🎁' : '📥'}
                           </div>
                           <div>
                              <p className="font-black text-slate-800 group-hover:text-primary-600 transition-colors">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.date}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'تم الاستلام' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.status}
                           </div>
                           <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                              <ArrowUpRight size={16} />
                           </button>
                        </div>
                     </div>
                   )) : (
                     <div className="p-12 text-center text-slate-400 font-bold">لا يوجد نشاطات مؤخراً.</div>
                   )}
                </div>
             </div>

            {/* Analytics Placeholder */}
             <div className="glass-card p-8 bg-gradient-to-br from-emerald-50 to-primary-50 border-none shrink-0 overflow-hidden relative group">
                <div className="relative z-10 flex items-center justify-between">
                   <div className="space-y-4 text-right">
                      <h4 className="text-2xl font-black text-emerald-900">ابدأ رحلة العطاء اليوم! 📈</h4>
                      <p className="text-sm font-medium text-emerald-700 max-w-sm">بمجرد بدئك في التبرع أو مساعدة الآخرين، ستظهر لك إحصائيات دقيقة حول أثرك الإنساني هنا.</p>
                      <button className="btn-primary h-12 px-8 bg-primary-950 hover:bg-black text-[10px]">نشر أول تبرع الآن</button>
                   </div>
                   <div className="w-48 h-48 bg-white/20 rounded-full p-8 group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp size={80} className="text-emerald-500/30" />
                   </div>
                </div>
             </div>
         </div>

         {/* Badges & Rewards */}
         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 pr-2 text-right">الأوسمة والجوائز</h3>
            <div className="glass-card p-8 space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'منقذ الأرواح', icon: Heart, count: '12+', color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'خبير الأدوية', icon: Package, count: '50+', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'عضو قديم', icon: Award, count: '1y+', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'سفير الخير', icon: Star, count: '5⭐', color: 'text-primary-600', bg: 'bg-primary-50' },
                  ].map((badge, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      className={`${badge.bg} p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border border-white`}
                    >
                       <badge.icon size={32} className={`${badge.color} mb-1`} />
                       <p className="text-[10px] font-black text-slate-800 leading-tight">{badge.label}</p>
                       <span className="text-[10px] font-bold opacity-40 uppercase">{badge.count}</span>
                    </motion.div>
                  ))}
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-50 text-right">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">تحديثات اجتماعية</h4>
                   <div className="flex items-center gap-3">
                      <div className="flex -space-x-reverse space-x-2">
                         <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                         <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                         <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500">أحمد وفاطمة و12 آخرين من أصدقائك تبرعوا اليوم!</p>
                   </div>
               </div>
            </div>

            {/* Help Card */}
            <div className="p-8 rounded-[2.5rem] bg-primary-950 text-white shadow-xl shadow-primary-200">
               <div className="flex items-center gap-4 mb-4 text-right">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">🤝</div>
                  <div>
                     <h4 className="text-lg font-black leading-tight">دعوة صديق</h4>
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">شارك الخير في مجتمعك</p>
                  </div>
               </div>
               <p className="text-xs font-medium leading-relaxed mb-6 text-right">ساهم في نشر الرسالة ودعوة أصدقائك للانضمام إلى منصة مسند لإنقاذ الأرواح.</p>
               <button className="w-full h-12 bg-white text-primary-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-50 transition-all">مشاركة كود الدعوة</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
