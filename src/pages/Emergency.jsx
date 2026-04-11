import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Clock, Phone, Share2, PlusCircle, ArrowLeft, MessageCircle, Trash2, Send } from 'lucide-react';
import { getEmergencyBoard, respondToSOS, adminDeleteRequest } from '../api';
import { getCurrentLocation } from '../utils/geolocation';

const Emergency = () => {
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{"role": "user"}'));
  const [responseMsg, setResponseMsg] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [newSOS, setNewSOS] = useState({
    medicine_name: '',
    description: '',
    urgency: 'منخفضة',
    location: '',
    latitude: null,
    longitude: null
  });

  const fetchSOS = async () => {
    setLoading(true);
    try {
      const response = await getEmergencyBoard();
      setSosRequests(response.data);
    } catch (error) {
      console.error("Error fetching SOS board:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation().then(coords => {
      setUserCoords(coords);
      setNewSOS(prev => ({ ...prev, ...coords }));
    }).catch(() => {});
    fetchSOS();
  }, []);

  const handleCreateSOS = async (e) => {
    e.preventDefault();
    try {
      await createSOSRequest(newSOS);
      setShowSOSForm(false);
      setNewSOS({ medicine_name: '', description: '', urgency: 'منخفضة', location: '', latitude: userCoords?.latitude, longitude: userCoords?.longitude });
      fetchSOS();
      alert("تم نشر استغاثتك بنجاح");
    } catch (e) {
      console.error(e);
      alert("فشل نشر الطلب");
    }
  };

  const handleResponse = async (requestId) => {
    if (!responseMsg[requestId]) return;
    try {
      await respondToSOS(requestId, responseMsg[requestId]);
      setResponseMsg({ ...responseMsg, [requestId]: '' });
      fetchSOS(); // Refresh to see new response
    } catch (e) { 
      console.error(e);
      alert("حدث خطأ أثناء إرسال الرد");
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      try {
        await adminDeleteRequest(requestId);
        fetchSOS();
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header with SOS Button */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <div className="sos-pulse">
               <span className="sos-pulse-ring"></span>
               <span className="sos-pulse-dot"></span>
            </div>
            مجتمع مسند — استغاثات عاجلة
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">ساعد في إنقاذ حياة — ابحث عن الدواء المفقود في صيدليتك أو منزلك</p>
        </div>
        <button 
          onClick={() => setShowSOSForm(true)}
          className="btn-danger h-16 px-10 rounded-3xl shadow-red-200/50 group"
        >
           <AlertCircle className="group-hover:scale-125 transition-transform" />
           أنا أحتاج دواء فوراً
        </button>
      </header>

      {/* SOS Form Modal */}
      <AnimatePresence>
        {showSOSForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSOSForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-right">نشر طلب استغاثة 🚨</h2>
              <form onSubmit={handleCreateSOS} className="space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">اسم الدواء المطلوب</label>
                  <input 
                    type="text" 
                    required
                    value={newSOS.medicine_name}
                    onChange={(e) => setNewSOS({...newSOS, medicine_name: e.target.value})}
                    placeholder="مثلاً: Glucophage 850mg"
                    className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">وصف الحالة أو الاحتياج</label>
                  <textarea 
                    rows="3"
                    value={newSOS.description}
                    onChange={(e) => setNewSOS({...newSOS, description: e.target.value})}
                    placeholder="أضف أي تفاصيل تساعدنا في العثور على الدواء..."
                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">درجة الاستعجال</label>
                    <select 
                      value={newSOS.urgency}
                      onChange={(e) => setNewSOS({...newSOS, urgency: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl outline-none font-bold text-slate-700"
                    >
                      <option value="منخفضة">منخفضة</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="قصوى">قصوى 🚨</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الموقع الحالي</label>
                    <input 
                      type="text" 
                      required
                      value={newSOS.location}
                      onChange={(e) => setNewSOS({...newSOS, location: e.target.value})}
                      placeholder="مثلاً: المعادي، القاهرة"
                      className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-grow h-14">نشر الاستغاثة الآن</button>
                  <button type="button" onClick={() => setShowSOSForm(false)} className="btn-secondary h-14 px-8">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOS Feed */}
      <div className="space-y-6">
         {loading ? (
            <div className="h-64 flex items-center justify-center">
               <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
         ) : sosRequests.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 font-bold">
               لا يوجد طلبات استغاثة حالياً. شكراً لوعيكم!
            </div>
         ) : (
           sosRequests.map((req, i) => (
             <motion.div
               key={req.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`glass-card p-0 group relative overflow-hidden transition-all hover:shadow-2xl ${req.urgency === 'قصوى' ? 'border-red-200' : ''}`}
             >
                <div className="p-8">
                  {req.urgency === 'قصوى' && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 -skew-x-12 translate-x-16 -translate-y-16"></div>
                  )}
                  
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
                     <div className="flex gap-6 flex-grow min-w-[300px] text-right">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner shrink-0 ${req.urgency === 'قصوى' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                           {req.urgency === 'قصوى' ? '🚨' : '💊'}
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                 <h2 className="text-2xl font-black text-slate-800 leading-none">{req.medicine_name}</h2>
                                 <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${req.urgency === 'قصوى' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-amber-500 text-white'}`}>
                                    أولوية {req.urgency}
                                 </span>
                              </div>
                              <p className="text-sm font-bold text-slate-500">{req.description || 'لا يوجد وصف إضافي'}</p>
                           </div>
                           
                           <div className="flex flex-wrap gap-6 items-center">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                 <MapPin size={14} className="text-primary-500" />
                                 <span>{req.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                 <Clock size={14} className="text-slate-300" />
                                 <span>نُشر في {new Date(req.created_at).toLocaleDateString('ar-EG')}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4 shrink-0 items-center">
                        {currentUser.role === 'admin' && (
                           <button 
                             onClick={() => handleDelete(req.id)}
                             className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                           >
                              <Trash2 size={20} />
                           </button>
                        )}
                        <button 
                          onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                          className={`btn-primary h-14 px-8 shadow-primary-600/20 gap-3 ${expandedId === req.id ? 'bg-slate-800 border-slate-800' : ''}`}
                        >
                           <MessageCircle size={20} />
                           {req.responses?.length || 0} ردود
                        </button>
                     </div>
                  </div>
                </div>

                {/* Responses Section */}
                <AnimatePresence>
                  {expandedId === req.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                    >
                      <div className="p-8 space-y-6">
                        {/* Existing Responses */}
                        <div className="space-y-4">
                          {req.responses && req.responses.length > 0 ? (
                            req.responses.map((resp) => (
                              <div key={resp.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">متبرع / صيدلية</span>
                                  <span className="text-[10px] text-slate-300 font-bold">{new Date(resp.created_at).toLocaleTimeString('ar-EG')}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{resp.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-xs font-bold text-slate-400 py-4 italic">لا يوجد ردود بعد. كن أول من يساعد!</p>
                          )}
                        </div>

                        {/* Reply Input */}
                        {(currentUser.role === 'pharmacy' || currentUser.role === 'donor' || currentUser.role === 'admin') && (
                          <div className="relative">
                            <input 
                              type="text"
                              value={responseMsg[req.id] || ''}
                              onChange={(e) => setResponseMsg({ ...responseMsg, [req.id]: e.target.value })}
                              placeholder="اكتب ردك هنا (مثلاً: الدواء متوفر في صيدليتنا)..."
                              className="w-full bg-white border border-slate-200 h-14 pr-6 pl-16 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm shadow-inner"
                              onKeyPress={(e) => e.key === 'Enter' && handleResponse(req.id)}
                            />
                            <button 
                              onClick={() => handleResponse(req.id)}
                              className="absolute left-2 top-2 w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
           ))
         )}
      </div>

      <div className="text-center pt-8">
         <button className="text-slate-400 font-bold hover:text-slate-600 transition-all text-xs uppercase tracking-[0.3em]">تحميل الأرشيف الكامل</button>
      </div>
    </div>
  );
};

export default Emergency;
