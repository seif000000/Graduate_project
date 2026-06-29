import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, MapPin, Grid, List as ListIcon, SlidersHorizontal, Camera, ChevronDown, X } from 'lucide-react';
import MedicineCard from '../components/MedicineCard';
import { getInventory, sendInboxMessage, getApiError } from '../api';
import toast from 'react-hot-toast';
import { getCurrentLocation, calculateDistance } from '../utils/geolocation';

const Search = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Modal and requesting state
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const fetchResults = async (query = '') => {
    setLoading(true);
    try {
      // 1. Get user location first
      let coords = userLocation;
      if (!coords) {
        try {
          coords = await getCurrentLocation();
          setUserLocation(coords);
        } catch (e) {
          console.warn("Geolocation permission denied");
        }
      }

      const response = await getInventory(query);
      const meds = response.data.map(med => ({
        ...med,
        distance: coords ? calculateDistance(coords.latitude, coords.longitude, med.latitude, med.longitude) : null
      }));
      
      setResults(meds);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error(getApiError(error, 'فشل تحميل نتائج البحث'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchResults(searchTerm);
    }
  };

  const handleOpenDetails = (med) => {
    setSelectedMedicine(med);
    setRequestMsg(`أهلاً، أنا مهتم بالحصول على دواء "${med.name}" المعروض للتبرع.`);
  };

  const handleRequestMedicine = async () => {
    if (!selectedMedicine || !selectedMedicine.donor_id) {
      toast.error('بيانات المتبرع غير مكتملة');
      return;
    }
    
    if (currentUser && currentUser.id === selectedMedicine.donor_id) {
      toast.error('لا يمكنك طلب دواء قمت أنت بنشره للتبرع');
      return;
    }

    setSendingRequest(true);
    try {
      // Send message to initiate chat
      await sendInboxMessage({
        receiver_id: selectedMedicine.donor_id,
        text: requestMsg
      });
      toast.success('تم إرسال طلبك وبدء المحادثة مع المتبرع بنجاح');
      setSelectedMedicine(null);
      // Navigate to inbox with query params to focus on this chat
      navigate(`/inbox?userId=${selectedMedicine.donor_id}&userName=${encodeURIComponent(selectedMedicine.donor_name || 'متبرع')}`);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل إرسال الطلب والتواصل مع المتبرع'));
    } finally {
      setSendingRequest(false);
    }
  };

  const categories = [
    { name: 'الكل', count: results.length },
    { name: 'مجاني', count: results.filter(r => r.price === 'مجاني' || r.price === 0).length },
    { name: 'أقراص', count: results.filter(r => r.category === 'tablets').length },
    { name: 'شراب', count: 0 },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Search Header */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow group w-full">
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon size={20} />
            </div>
            <input 
              type="text" 
              placeholder="ابحث باسم الدواء أو المادة الفعالة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full h-16 pr-14 pl-24 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-700"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
               <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all">
                  <Camera size={18} />
               </button>
               <button onClick={() => fetchResults(searchTerm)} className="btn-primary h-10 px-5 text-sm">بحث</button>
            </div>
          </div>
          <button className="h-16 px-8 glass-card flex items-center gap-3 text-slate-600 hover:text-primary-600 transition-all font-black text-sm shrink-0">
             <MapPin size={18} className="text-primary-500" />
             القاهرة، المعادي
             <ChevronDown size={14} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <button 
              key={i}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
                i === 0 
                ? 'bg-primary-950 text-white border-primary-950 shadow-lg shadow-primary-900/20' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-primary-200 hover:text-slate-600'
              }`}
            >
              {cat.name}
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${i === 0 ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Results Controls */}
      <section className="flex items-center justify-between border-b border-slate-100 pb-6">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">النتائج المتاحة</h2>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">تحديث مباشر</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setView('grid')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}><Grid size={18} /></button>
               <button onClick={() => setView('list')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}><ListIcon size={18} /></button>
            </div>
            <button className="h-12 px-5 glass-card flex items-center gap-2 text-xs font-black text-slate-600">
               <SlidersHorizontal size={16} />
               ترتيب حسب الأقرب
            </button>
         </div>
      </section>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">جاري جلب الأدوية المتاحة...</p>
        </div>
      ) : results.length > 0 ? (
        <motion.div 
          layout
          className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          <AnimatePresence>
            {results.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MedicineCard med={item} onDetail={handleOpenDetails} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="py-20 text-center glass-card">
           <div className="text-4xl mb-4">🔍</div>
           <h3 className="text-xl font-black text-slate-800 mb-2">عذراً، لم نجد نتائج</h3>
           <p className="text-slate-400 max-w-xs mx-auto text-sm">حاول البحث بكلمات أخرى أو تصفح الأقسام للعثور على ما تحتاجه.</p>
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="flex justify-center pt-8">
        <button className="h-14 px-10 border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">تحميل المزيد من النتائج</button>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedMedicine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedicine(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">تفاصيل الدواء 💊</h3>
                <button onClick={() => setSelectedMedicine(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 text-right">
                <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl">💊</div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800">{selectedMedicine.name}</h2>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                      selectedMedicine.price === 'مجاني' || selectedMedicine.price === 0
                        ? 'bg-red-50 text-red-600'
                        : 'bg-primary-50 text-primary-600'
                    }`}>
                      {selectedMedicine.price === 'مجاني' || selectedMedicine.price === 0 ? 'مجاني ❤️' : `${selectedMedicine.price} ج.م`}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400">{selectedMedicine.generic_name || 'الاسم العلمي غير مسجل'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">تاريخ الصلاحية</p>
                    <p className="text-slate-800 font-black">{selectedMedicine.expiry_date}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">الكمية المتاحة</p>
                    <p className="text-slate-800 font-black">{selectedMedicine.quantity}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 col-span-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">الموقع الجغرافي</p>
                    <p className="text-slate-800 font-black flex items-center gap-2">
                      <MapPin size={12} className="text-primary-500" />
                      {selectedMedicine.location}
                      {selectedMedicine.distance && (
                        <span className="text-primary-600 font-black">(يبعد {selectedMedicine.distance} كم)</span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedMedicine.batch_info && (
                  <div className="p-4 border border-slate-100 rounded-2xl text-xs font-bold">
                    <span className="text-slate-400">رقم التشغيلة: </span>
                    <span className="text-slate-800 font-black">{selectedMedicine.batch_info}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-black text-slate-800">بيانات الناشر (المتبرع)</h4>
                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black">
                      {(selectedMedicine.donor_name || 'م').slice(0, 1)}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800 text-sm">{selectedMedicine.donor_name || 'متبرع فاعل خير'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {selectedMedicine.donor_role === 'pharmacy' ? 'صيدلية مشاركة 🏥' : 'متبرع فردي 👤'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request form submission */}
                {currentUser && currentUser.id !== selectedMedicine.donor_id ? (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">رسالة التواصل</label>
                    <textarea
                      value={requestMsg}
                      onChange={e => setRequestMsg(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none focus:border-primary-400 resize-none transition-all"
                    />
                    <button
                      onClick={handleRequestMedicine}
                      disabled={sendingRequest}
                      className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-60 text-sm"
                    >
                      {sendingRequest ? 'جاري التواصل...' : 'طلب الدواء وتواصل مع المتبرع 💬'}
                    </button>
                  </div>
                ) : currentUser ? (
                  <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl text-center text-xs font-bold">
                    هذا الدواء قمت أنت بنشره للتبرع
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-center text-xs font-bold">
                    يرجى تسجيل الدخول للتمكن من طلب الدواء
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
