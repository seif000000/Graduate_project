import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Clock, CheckCircle, XCircle, Search, Filter, Info, MapPin, Trash2, Star, X } from 'lucide-react';
import { getMyRequests, deleteMyRequest, submitFeedback, createSOSRequest, getApiError } from '../api';
import { getCurrentLocation } from '../utils/geolocation';
import { formatDate, formatDateTime } from '../utils/formatDate';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';


const MyRequests = () => {
  const { t } = useLang();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('جميع الحالات');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(null); // { requestId }
  const [detailsModal, setDetailsModal] = useState(null); // full request object
  const [voucherModal, setVoucherModal] = useState(null); // full request object
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // request ID


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
      toast.success(t('myRequests.createSuccess'));
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
      toast.error(getApiError(error, t('myRequests.createFail')));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.data);
    } catch (e) {
      toast.error(getApiError(e, t('myRequests.statusFail')));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMyRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      toast.error(getApiError(e, t('myRequests.deleteFail')));
    }
  };


  const handleFeedbackSubmit = async () => {
    if (!feedbackModal) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback(feedbackModal.requestId, { rating, comment });
      toast.success(t('myRequests.feedbackSuccess'));
      setFeedbackModal(null);
      setRating(5);
      setComment('');
    } catch (e) {
      toast.error(getApiError(e, t('myRequests.feedbackFail')));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusInfo = (status) => {
    switch(status) {
      case 'fulfilled': return { label: t('myRequests.statusFulfilled'), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' };
      case 'approved': return { label: t('myRequests.statusApproved'), icon: Clock, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' };
      case 'pending': return { label: t('myRequests.statusPending'), icon: Info, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' };
      case 'cancelled': return { label: t('myRequests.statusCancelled'), icon: XCircle, color: 'text-red-600 bg-red-50', border: 'border-red-100' };
      default: return { label: t('myRequests.statusUnknown'), icon: Info, color: 'text-slate-600 bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <ListChecks className="text-primary-600" size={40} />
            {t('myRequests.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('myRequests.subtitle')}</p>
        </div>
        <button
          onClick={handleOpenRequestModal}
          className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20"
        >
           {t('myRequests.newRequest')}
        </button>
      </header>

      {/* Filter Bar */}
      <section className="glass-card p-6 flex flex-wrap items-center gap-6">
        <div className="flex-grow min-w-[300px] relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('myRequests.searchPlaceholder')}
            className="w-full bg-slate-50 border border-slate-200 h-12 ps-12 pe-4 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 bg-slate-50 border border-slate-200 px-6 rounded-xl font-bold text-slate-600 outline-none"
          >
            <option value="جميع الحالات">{t('myRequests.allStatuses')}</option>
            <option value="pending">{t('myRequests.statusPending')}</option>
            <option value="approved">{t('myRequests.statusApproved')}</option>
            <option value="fulfilled">{t('myRequests.statusFulfilled')}</option>
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
                  <div className="flex gap-6 items-start text-start w-full md:w-auto">
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
                        <p className="text-[10px] font-black text-slate-300">{t('myRequests.requestDate')} {formatDate(req.created_at)} | REQ-{req.id}</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                     <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border ${status.color} ${status.border}`}>
                        <status.icon size={14} />
                        {status.label}
                     </div>
                      <div className="flex gap-2">
                         <button onClick={() => setDetailsModal(req)} className="h-10 px-6 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-slate-100 transition-all">{t('myRequests.details')}</button>
                         {req.status === 'pending' && (
                            <button
                              onClick={() => setConfirmDelete(req.id)}
                              className="h-10 px-4 rounded-xl bg-red-50 text-red-500 font-bold text-xs hover:bg-red-100 transition-all flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                         )}
                         {req.status === 'approved' && (
                            <button onClick={() => setVoucherModal(req)} className="h-10 px-6 rounded-xl bg-primary-600 text-white font-black text-xs shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all">{t('myRequests.showVoucher')}</button>
                         )}
                         {req.status === 'fulfilled' && (
                            <button
                               onClick={() => setFeedbackModal({ requestId: req.id })}
                               className="h-10 px-5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-400/30 flex items-center gap-2 hover:bg-amber-600 transition-all"
                            >
                               <Star size={13} fill="white" /> {t('myRequests.rate')}
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
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myRequests.feedbackTitle')}</h3>
                <button onClick={() => setFeedbackModal(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 mb-3">{t('myRequests.satisfactionQuestion')}</p>
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
                  placeholder={t('myRequests.commentPlaceholder')}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-primary-400 resize-none transition-all"
                />

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  className="w-full h-14 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {submittingFeedback ? t('myRequests.sending') : t('myRequests.submitFeedback')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDetailsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myRequests.detailsTitle')}</h3>
                <button onClick={() => setDetailsModal(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-start">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-inner">💊</div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800">{detailsModal.medicine_name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REQ-{detailsModal.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">{t('myRequests.statusLabel')}</p>
                    <p className="text-slate-800 font-black">{getStatusInfo(detailsModal.status).label}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">{t('myRequests.urgencyLabel')}</p>
                    <p className="text-slate-800 font-black">{detailsModal.urgency}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 col-span-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">{t('myRequests.locationLabel')}</p>
                    <p className="text-slate-800 font-black flex items-center gap-2">
                      <MapPin size={12} className="text-primary-500" />
                      {detailsModal.location}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 col-span-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">{t('myRequests.requestDateLabel')}</p>
                    <p className="text-slate-800 font-black">{formatDateTime(detailsModal.created_at)}</p>
                  </div>
                </div>

                {detailsModal.description && (
                  <div className="p-4 border border-slate-100 rounded-2xl text-xs font-bold">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('myRequests.descNotes')}</p>
                    <p className="text-slate-700 leading-relaxed">{detailsModal.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voucher Modal */}
      <AnimatePresence>
        {voucherModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setVoucherModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myRequests.voucherTitle')}</h3>
                <button onClick={() => setVoucherModal(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="text-center space-y-5">
                <p className="text-sm font-bold text-slate-500">{t('myRequests.voucherIntro')} «{voucherModal.medicine_name}».</p>
                <div className="relative bg-primary-950 text-white rounded-3xl p-6 overflow-hidden">
                  <div className="absolute -end-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />
                  <div className="absolute -start-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-300 mb-2">{t('myRequests.pickupCode')}</p>
                  <p className="text-3xl font-black tracking-[0.2em] font-mono">MSND-{String(voucherModal.id).padStart(4, '0')}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-800">
                  {t('myRequests.voucherNote')}
                </div>
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
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myRequests.newRequestTitle')}</h3>
                <button onClick={() => setShowRequestModal(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateRequestSubmit} className="space-y-6 text-start">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myRequests.medicineLabel')}</label>
                  <input
                    type="text"
                    required
                    value={requestFormData.medicine_name}
                    onChange={(e) => setRequestFormData({...requestFormData, medicine_name: e.target.value})}
                    placeholder={t('myRequests.medicinePlaceholder')}
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myRequests.urgencyFieldLabel')}</label>
                  <select
                    value={requestFormData.urgency}
                    onChange={(e) => setRequestFormData({...requestFormData, urgency: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                  >
                    <option value="متوسطة">{t('myRequests.urgencyMedium')}</option>
                    <option value="عالية">{t('myRequests.urgencyHigh')}</option>
                    <option value="قصوى">{t('myRequests.urgencyCritical')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myRequests.caseDetailsLabel')}</label>
                  <textarea
                    rows={3}
                    value={requestFormData.description}
                    onChange={(e) => setRequestFormData({...requestFormData, description: e.target.value})}
                    placeholder={t('myRequests.caseDetailsPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myRequests.pickupLocationLabel')}</label>
                  <input
                    type="text"
                    required
                    value={requestFormData.location}
                    onChange={(e) => setRequestFormData({...requestFormData, location: e.target.value})}
                    placeholder={t('myRequests.pickupLocationPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full h-14 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {submittingRequest ? t('myRequests.sending') : t('myRequests.submitRequest')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={!!confirmDelete}
        variant="delete"
        message={t('myRequests.deleteConfirm')}
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default MyRequests;
