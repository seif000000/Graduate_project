import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Clock, Phone, Share2, PlusCircle, ArrowLeft, MessageCircle, Trash2, Send } from 'lucide-react';
import { getEmergencyBoard, respondToSOS, adminDeleteRequest, createSOSRequest, getApiError } from '../api';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../utils/geolocation';
import { formatDate, formatTime } from '../utils/formatDate';
import { useLang } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';


const Emergency = () => {
  const { t } = useLang();
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{"role": "user"}'));
  const [responseMsg, setResponseMsg] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [submittingSOS, setSubmittingSOS] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // request ID
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
      toast.error(getApiError(error, t('emergency.fetchError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation().then(coords => {
      setUserCoords(coords);
      setNewSOS(prev => ({ ...prev, ...coords }));
      
      // Reverse geocode user location using OpenStreetMap Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=ar`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const address = data.address;
            const city = address.city || address.town || address.county || '';
            const suburb = address.suburb || address.neighbourhood || address.district || '';
            const formatted = [suburb, city].filter(Boolean).join('، ') || data.name || '';
            if (formatted) {
              setNewSOS(prev => ({ ...prev, location: formatted }));
            }
          }
        }).catch(err => console.warn("Reverse geocode error:", err));
    }).catch(() => {});
    fetchSOS();
  }, []);

  const handleCreateSOS = async (e) => {
    e.preventDefault();
    if (submittingSOS) return;
    setSubmittingSOS(true);
    try {
      await createSOSRequest(newSOS);
      setShowSOSForm(false);
      setNewSOS({ medicine_name: '', description: '', urgency: 'منخفضة', location: '', latitude: userCoords?.latitude, longitude: userCoords?.longitude });
      fetchSOS();
      toast.success(t('emergency.publishSuccess'));
    } catch (e) {
      toast.error(getApiError(e, t('emergency.publishFail')));
    } finally {
      setSubmittingSOS(false);
    }
  };

  const handleResponse = async (requestId) => {
    if (!responseMsg[requestId]) return;
    try {
      await respondToSOS(requestId, responseMsg[requestId]);
      setResponseMsg({ ...responseMsg, [requestId]: '' });
      fetchSOS(); // Refresh to see new response
    } catch (e) { 
      toast.error(getApiError(e, t('emergency.replyFail')));
    }
  };

  const handleDelete = async (requestId) => {
    try {
      await adminDeleteRequest(requestId);
      fetchSOS();
      setConfirmDelete(null);
    } catch (e) {
      toast.error(getApiError(e, t('emergency.deleteFail')));
    }
  };


  return (
    <div className="space-y-8 pb-12">
      {/* Header with SOS Button */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <div className="sos-pulse">
               <span className="sos-pulse-ring"></span>
               <span className="sos-pulse-dot"></span>
            </div>
            {t('emergency.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('emergency.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowSOSForm(true)}
          className="btn-danger h-16 px-10 rounded-3xl shadow-red-200/50 group"
        >
           <AlertCircle className="group-hover:scale-125 transition-transform" />
           {t('emergency.needNow')}
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
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-start">{t('emergency.formTitle')}</h2>
              <form onSubmit={handleCreateSOS} className="space-y-6 text-start">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('emergency.medicineLabel')}</label>
                  <input
                    type="text"
                    required
                    value={newSOS.medicine_name}
                    onChange={(e) => setNewSOS({...newSOS, medicine_name: e.target.value})}
                    placeholder={t('emergency.medicinePlaceholder')}
                    className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('emergency.descLabel')}</label>
                  <textarea
                    rows="3"
                    value={newSOS.description}
                    onChange={(e) => setNewSOS({...newSOS, description: e.target.value})}
                    placeholder={t('emergency.descPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('emergency.urgencyLabel')}</label>
                    <select
                      value={newSOS.urgency}
                      onChange={(e) => setNewSOS({...newSOS, urgency: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl outline-none font-bold text-slate-700"
                    >
                      <option value="منخفضة">{t('emergency.urgencyLow')}</option>
                      <option value="متوسطة">{t('emergency.urgencyMedium')}</option>
                      <option value="قصوى">{t('emergency.urgencyCritical')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('emergency.locationLabel')}</label>
                    <input
                      type="text"
                      required
                      value={newSOS.location}
                      onChange={(e) => setNewSOS({...newSOS, location: e.target.value})}
                      placeholder={t('emergency.locationPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-100 h-14 px-6 rounded-2xl outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={submittingSOS} className="btn-primary flex-grow h-14 disabled:opacity-50">
                    {submittingSOS ? t('emergency.publishing') : t('emergency.publishNow')}
                  </button>
                  <button type="button" onClick={() => setShowSOSForm(false)} className="btn-secondary h-14 px-8">{t('common.cancel')}</button>
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
               {t('emergency.empty')}
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
                    <div className="absolute top-0 start-0 w-32 h-32 bg-red-600/5 -skew-x-12 translate-x-16 -translate-y-16"></div>
                  )}

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
                     <div className="flex gap-6 flex-grow min-w-[300px] text-start">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner shrink-0 ${req.urgency === 'قصوى' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                           {req.urgency === 'قصوى' ? '🚨' : '💊'}
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                 <h2 className="text-2xl font-black text-slate-800 leading-none">{req.medicine_name}</h2>
                                 <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${req.urgency === 'قصوى' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-amber-500 text-white'}`}>
                                    {t('emergency.priority')} {req.urgency}
                                 </span>
                              </div>
                              <p className="text-sm font-bold text-slate-500">{req.description || t('emergency.noExtraDesc')}</p>
                           </div>
                           
                           <div className="flex flex-wrap gap-6 items-center">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                 <MapPin size={14} className="text-primary-500" />
                                 <span>{req.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                 <Clock size={14} className="text-slate-300" />
                                 <span>{t('emergency.publishedOn')} {formatDate(req.created_at)}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4 shrink-0 items-center">
                        {currentUser.role === 'admin' && (
                           <button 
                             onClick={() => setConfirmDelete(req.id)}
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
                           {req.responses?.length || 0} {t('emergency.responses')}
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
                              <div key={resp.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-start">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{t('emergency.donorPharmacy')}</span>
                                  <span className="text-[10px] text-slate-300 font-bold">{formatTime(resp.created_at)}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{resp.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-xs font-bold text-slate-400 py-4 italic">{t('emergency.noResponses')}</p>
                          )}
                        </div>

                        {/* Reply Input */}
                        {currentUser && (
                          <div className="relative">
                            <input 
                              type="text"
                              value={responseMsg[req.id] || ''}
                              onChange={(e) => setResponseMsg({ ...responseMsg, [req.id]: e.target.value })}
                              placeholder={t('emergency.replyPlaceholder')}
                              className="w-full bg-white border border-slate-200 h-14 ps-6 pe-16 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm shadow-inner"
                              onKeyPress={(e) => e.key === 'Enter' && handleResponse(req.id)}
                            />
                            <button
                              onClick={() => handleResponse(req.id)}
                              className="absolute start-2 top-2 w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30"
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
         <button onClick={fetchSOS} className="text-slate-400 font-bold hover:text-slate-600 transition-all text-xs uppercase tracking-[0.3em]">{t('emergency.refresh')}</button>
      </div>
      <ConfirmDialog
        open={!!confirmDelete}
        variant="delete"
        message={t('emergency.deleteConfirm')}
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Emergency;
