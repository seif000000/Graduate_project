import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Users, Clock, ShieldCheck, ChevronRight, 
  Package, Search, PlusCircle, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(res => {
      setDashboardData(res.data);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: 'أدويتي المتبرع بها', value: dashboardData?.stats?.total_donations || '0', icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'طلباتي المعلقة', value: dashboardData?.stats?.total_requests || '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'أرواح ساهمت في إنقاذها', value: dashboardData?.stats?.lives_saved || '0', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const recentHistory = dashboardData?.recent_history || [];
  const userName = JSON.parse(localStorage.getItem('user'))?.full_name || 'صديق مسند';

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Simple Welcome Hero */}
      <section className="bg-primary-600 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-primary-600/20">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
           <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-widest backdrop-blur-md">
                 <ShieldCheck size={14} /> عضو موثق
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                 أهلاً بك يا {userName.split(' ')[0]} 👋
              </h1>
              <p className="text-primary-100 font-medium text-lg max-w-sm">
                 في مسند، كل دواء تشاركه يمثل جرعة أمل وحياة جديدة لشخص آخر.. شكراً لعطائك.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link to="/donate" className="h-14 px-8 bg-white text-primary-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-xl">
                 <PlusCircle size={20} />
                 تبرع الآن
              </Link>
              <Link to="/emergency" className="h-14 px-8 bg-primary-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary-800 transition-colors border border-primary-500">
                 <AlertCircle size={20} />
                 طلب استغاثة
              </Link>
           </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-900 opacity-20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Quick Actions Menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Link to="/search" className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-500 flex items-center justify-center transition-colors">
               <Search size={20} />
            </div>
            <span className="text-sm font-black text-slate-700">البحث عن دواء</span>
         </Link>
         <Link to="/requests" className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-amber-50 text-slate-400 group-hover:text-amber-500 flex items-center justify-center transition-colors">
               <Clock size={20} />
            </div>
            <span className="text-sm font-black text-slate-700">متابعة طلباتي</span>
         </Link>
         <Link to="/my-donations" className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-500 flex items-center justify-center transition-colors">
               <Package size={20} />
            </div>
            <span className="text-sm font-black text-slate-700">سجل التبرعات</span>
         </Link>
         <Link to="/health-ai" className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer border border-primary-100 bg-primary-50/30">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
               🤖
            </div>
            <span className="text-sm font-black text-primary-800">مساعدك الذكي</span>
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Simple Stats Highlights */}
         <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-black text-slate-800 px-2 border-r-4 border-primary-500 pr-3">أثرك في مسند</h3>
            <div className="space-y-4">
               {stats.map((stat, i) => (
                 <div key={i} className="glass-card p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${stat.bg} ${stat.color}`}>
                       <stat.icon size={20} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-slate-800 leading-none">{stat.value}</h4>
                       <p className="text-xs font-bold text-slate-400 mt-1">{stat.label}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Recent Activity List */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2 text-right">
               <h3 className="text-lg font-black text-slate-800 border-r-4 border-primary-500 pr-3">أحدث النشاطات</h3>
               <Link to="/requests" className="text-primary-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">عرض التفاصيل <ArrowLeft size={12} /></Link>
            </div>
            
            <div className="glass-card border border-slate-100 overflow-hidden">
               {loading ? (
                 <div className="text-center p-8 text-slate-400 font-bold">جاري التحميل...</div>
               ) : recentHistory.length > 0 ? (
                 <div className="divide-y divide-slate-50">
                   {recentHistory.map((item, i) => (
                     <div key={i} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${item.type === 'تبرع' ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-600'}`}>
                              {item.type === 'تبرع' ? '🎁' : '📥'}
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{item.date}</p>
                           </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${item.status === 'تم الاستلام' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                           {item.status}
                        </span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl grayscale opacity-50">📦</div>
                    <div>
                       <p className="font-black text-slate-700">دفترك فارغ حالياً</p>
                       <p className="text-sm text-slate-400 font-medium mt-1">سجل نشاطك سيبدأ بالظهور هنا فور تبرعك الأول.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
