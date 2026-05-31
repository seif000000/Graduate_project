import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  AlertTriangle, 
  Heart, 
  Search, 
  ShieldAlert, 
  HandHeart,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { getAllRequests, getApiError } from '../api';
import { toast } from 'react-hot-toast';

const Community = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'emergency', 'aid'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getAllRequests();
        setRequests(res.data);
      } catch (e) {
        console.error(e);
        toast.error(getApiError(e, 'فشل تحميل طلبات المجتمع'));
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const tabs = [
    { id: 'feed', name: 'طلبات المجتمع', icon: Users },
    { id: 'emergency', name: 'استغاثات عاجلة', icon: AlertTriangle },
    { id: 'aid', name: 'المساعدات المالية', icon: HandHeart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 mt-10" dir="rtl">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">مجتمع مُسند</h1>
            <p className="text-slate-600">هنا نلتقي لنتكاتف، اطلب دوائك أو ساعد غيرك في إيجاده.</p>
          </div>
          <button className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl shadow-primary-200 ring-4 ring-primary-50">
            <Plus size={20} />
            إضافة طلب استغاثة
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 w-fit mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                activeTab === tab.id 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {requests.map(req => (
                    <div key={req.id} className="glass-card p-6 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg border-2 border-white shadow-sm overflow-hidden">
                            {req.medicine_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">مستخدم مُسند</h3>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {req.location}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          req.urgency === 'طارئ' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-primary-50 text-primary-600'
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="font-bold text-primary-700 mb-1">دواء مطلوب: {req.medicine_name}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex gap-4">
                          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
                            <MessageCircle size={16} />
                            ردود قيد الانتظار
                          </button>
                          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors">
                            <Share2 size={16} />
                            مشاركة
                          </button>
                        </div>
                        <button 
                          onClick={() => toast.success('رائع! سيتم إخطار المحتاج بعرضك الكريم ❤️')}
                          className="bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                        >
                          أنا عندي الدواء
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'emergency' && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-900 mb-2">استغاثات عاجلة (نقص أدوية)</h2>
                    <p className="text-red-700 max-w-lg mx-auto mb-6">هذا القسم مخصص للأدوية النادرة أو الحالات الطارئة جداً. يتم إرسال تنبيهات فورية لجميع الصيادلة والمتبرعين عند إضافة طلب هنا.</p>
                  </div>
                  {/* Reuse feed component with only 'طارئ' filtering in a real app */}
                  <div className="text-center py-20 text-slate-400">
                    <AlertTriangle size={40} className="mx-auto mb-4 opacity-20" />
                    <p>لا توجد استغاثات عاجلة حالياً في منطقتك.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'aid' && (
                <motion.div
                  key="aid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="glass-card p-10 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
                    <HandHeart size={120} className="absolute -bottom-4 -left-4 opacity-10 rotate-12" />
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-4">قسم غير المقتدرين</h2>
                      <p className="text-primary-100 max-w-xl leading-relaxed mb-8">
                        نحن نؤمن بأن الدواء حق للجميع. نوفر آلية للتأكد من استحقاق المرضى للدواء مجاناً 100% من خلال فريق من المتطوعين لفحص الحالات.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all flex items-center gap-2">
                          <Plus size={20} />
                          طلب مساعدة مالية
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                          كيف نتحقق من الحالات؟
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <ShieldAlert size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">كيف نضمن المصداقية؟</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        نقوم بالربط مع مؤسسات خيرية موثوقة ونطلب أوراقاً رسمية (تقارير طبية، بحث اجتماعي) لضمان وصول المساعدة لمستحقيها الفعليين.
                      </p>
                    </div>
                    <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4">
                      <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                        <Heart size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">كن شريكاً في الخير</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        إذا كنت صيدلياً أو متبرعاً دائماً، يمكنك الانضمام لبرنامج "حياة" لتبني حالات غير مقتدرة وتوفير دوائهم بشكل دوري.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-primary-100 bg-primary-50/30">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-primary-600" />
                قواعد المجتمع
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> ممنوع تداول أدوية "الجدول" أو المخدرة.</li>
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> تأكد دائماً من صلاحية الدواء قبل التسليم.</li>
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> تواصل مع صاحب الاستغاثة في العام أولاً للأمان.</li>
              </ul>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-bold text-slate-900 mb-4">أكثر الأدوية المطلوبة</h4>
              <div className="space-y-2">
                {['إيبوتين', 'حقن RH', 'أنسولين نوفيورابيد'].map(item => (
                  <div key={item} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] text-slate-400 font-bold border border-slate-100">ناقص</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-lg text-center space-y-4">
              <HelpCircle size={40} className="text-slate-200 mx-auto" />
              <h4 className="font-bold text-slate-900">لديك استفسار؟</h4>
              <p className="text-xs text-slate-500">تواصل مع فريق الدعم الفني للمنصة في أي وقت.</p>
              <button className="text-primary-600 font-bold text-sm hover:underline">مركز المساعدة</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
