import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Clock, CheckCircle, XCircle, Search, Filter, Info, MapPin, Trash2, Star, X } from 'lucide-react';
import { getMyRequests, deleteMyRequest, submitFeedback, createSOSRequest, getApiError } from '../api';
import { getCurrentLocation } from '../utils/geolocation';
import toast from 'react-hot-toast';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('جميع الحالات');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(null); // { requestId }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // New Request Form states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    medicine_name: '',
    urgency: 'متوسطة',
    description: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const handleOpenRequestModal = () => {
    setShowRequestModal(true);
    // Fetch user coordinates
    getCurrentLocation().then(coords => {
      setRequestFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
      // Reverse geocode using OpenStreetMap Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=ar`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const address = data.address;
            const city = address.city || address.town || address.county || '';
            const suburb = address.suburb || address.neighbourhood || address.district || '';
            const formatted = [suburb, city].filter(Boolean).join('، ') || data.name || '';
            if (formatted) {
              setRequestFormData(prev => ({ ...prev, location: formatted }));
            }
          }
        }).catch(err => console.warn(err));
    }).catch(() => {});
  };

  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    if (submittingRequest) return;
    setSubmittingRequest(true);
    try {
      await createSOSRequest(requestFormData);
      toast.success('تم إنشاء طلب الدواء الجديد بنجاح');
      setShowRequestModal(false);
      // Reset form
      setRequestFormData({
        medicine_name: '',
        urgency: 'متوسطة',
        description: '',
        location: '',
        latitude: null,
        longitude: null
      });
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(getApiError(error, 'فشل إنشاء الطلب'));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل الطلبات'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) {
      try {
        await deleteMyRequest(id);
        setRequests(requests.filter(r => r.id !== id));
      } catch (e) {
        toast.error(getApiError(e, 'حدث خطأ أثناء الحذف'));
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackModal) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback(feedbackModal.requestId, { rating, comment });
      toast.success('شكراً! تم إرسال تقييمك بنجاح ⭐');
      setFeedbackModal(null);
      setRating(5);
      setComment('');
    } catch (e) {
      toast.error(getApiError(e, 'فشل إرسال التقييم'));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusInfo = (status) => {
    switch(status) {
      case 'fulfilled': return { label: 'تم الاستلام', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' };
      case 'approved': return { label: 'بانتظار الاستلام', icon: Clock, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' };
      case 'pending': return { label: 'قيد المراجعة', icon: Info, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' };
      case 'cancelled': return { label: 'ملغي', icon: XCircle, color: 'text-red-600 bg-red-50', border: 'border-red-100' };
      default: return { label: 'مجهول', icon: Info, color: 'text-slate-600 bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <ListChecks className="text-primary-600" size={40} />
            طلباتي
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">متابعة حالة طلبات الأدوية التي قمت بالتقديم عليها</p>
        </div>
        <button 
          onClick={handleOpenRequestModal}
          className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20"
        >
           + طلب دواء جديد
        </button>
      </header>

      {/* Filter Bar */}
      <section className="glass-card p-6 flex flex-wrap items-center gap-6">
        <div className="flex-grow min-w-[300px] relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث برقم الطلب أو اسم الدواء..." 
            className="w-full bg-slate-50 border border-slate-200 h-12 pr-12 pl-4 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 bg-slate-50 border border-slate-200 px-6 rounded-xl font-bold text-slate-600 outline-none"
          >
            <option>جميع الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">بانتظار الاستلام</option>
            <option value="fulfilled">تم الاستلام</option>
          </select>
        </div>
      </section>

      {/* Request Cards */}
      <div className="grid grid-cols-1 gap-6">
        {requests
          .filter(r => filter === 'جميع الحالات' || r.status === filter)
          .filter(r => r.medicine_name?.includes(searchTerm) || String(r.id).includes(searchTerm))
          .map((req, i) => {
          const status = getStatusInfo(req.status);
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-0 overflow-hidden border-transparent hover:border-primary-200 transition-all flex flex-col md:flex-row group"
            >
               {/* Status Sidebar */}
               <div className={`w-2 shrink-0 ${status.color.split(' ')[1].replace('-50', '-500')}`} />
               
               <div className="flex-grow p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex gap-6 items-start text-right w-full md:w-auto">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                        💊
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-xl font-black text-slate-800">{req.medicine_name}</h3>
                           <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-400 rounded">{req.urgency}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                           <MapPin size={12} className="text-primary-500" />
                           {req.location}
                        </p>
                        <p className="text-[10px] font-black text-slate-300">تاريخ الطلب: {new Date(req.created_at).toLocaleDateString()} | REQ-{req.id}</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                     <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border ${status.color} ${status.border}`}>
                        <status.icon size={14} />
                        {status.label}
                     </div>
                      <div className="flex gap-2">
                         <button className="h-10 px-6 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-slate-100 transition-all">التفاصيل</button>
                         {req.status === 'pending' && (
                            <button 
                              onClick={() => handleDelete(req.id)}
                              className="h-10 px-4 rounded-xl bg-red-50 text-red-500 font-bold text-xs hover:bg-red-100 transition-all flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                         )}
                         {req.status === 'approved' && (
                            <button className="h-10 px-6 rounded-xl bg-primary-600 text-white font-black text-xs shadow-lg shadow-primary-500/30">عرض الكوبون</button>
                         )}
                         {req.status === 'fulfilled' && (
                            <button
                               onClick={() => setFeedbackModal({ requestId: req.id })}
                               className="h-10 px-5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-400/30 flex items-center gap-2 hover:bg-amber-600 transition-all"
                            >
                               <Star size={13} fill="white" /> تقييم
                            </button>
                         )}
                      </div>
                  </div>
               </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFeedbackModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">تقييم الطلب</h3>
                <button onClick={() => setFeedbackModal(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 mb-3">ما مدى رضاك عن الخدمة؟</p>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        <Star size={32} className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="أضف تعليقاً (اختياري)..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-primary-400 resize-none transition-all"
                />

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  className="w-full h-14 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {submittingFeedback ? 'جاري الإرسال...' : 'إرسال التقييم ⭐'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">طلب دواء جديد 📝</h3>
                <button onClick={() => setShowRequestModal(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateRequestSubmit} className="space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">اسم الدواء المطلوب</label>
                  <input 
                    type="text" 
                    required
                    value={requestFormData.medicine_name}
                    onChange={(e) => setRequestFormData({...requestFormData, medicine_name: e.target.value})}
                    placeholder="مثلاً: Glucophage 850mg"
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">درجة الاستعجال</label>
                  <select 
                    value={requestFormData.urgency}
                    onChange={(e) => setRequestFormData({...requestFormData, urgency: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                  >
                    <option value="متوسطة">متوسطة</option>
                    <option value="عالية">عالية</option>
                    <option value="قصوى">قصوى 🚨</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">تفاصيل الحالة أو الوصف</label>
                  <textarea 
                    rows={3}
                    value={requestFormData.description}
                    onChange={(e) => setRequestFormData({...requestFormData, description: e.target.value})}
                    placeholder="اكتب أي ملاحظات إضافية عن الدواء أو الجرعة..."
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">الموقع (مكان الاستلام)</label>
                  <input 
                    type="text" 
                    required
                    value={requestFormData.location}
                    onChange={(e) => setRequestFormData({...requestFormData, location: e.target.value})}
                    placeholder="مثلاً: المعادي، القاهرة"
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full h-14 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {submittingRequest ? 'جاري الإرسال...' : 'تأكيد ونشر طلب الدواء 🚀'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyRequests;
