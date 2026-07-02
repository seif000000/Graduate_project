import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, MapPin, Grid, List as ListIcon, SlidersHorizontal, Camera, X } from 'lucide-react';
import MedicineCard from '../components/MedicineCard';
import { RatingStars, VerifiedBadge } from '../components/RatingStars';
import { getInventory, sendInboxMessage, getApiError } from '../api';
import { identifyMedicineFromImage } from '../services/gemini';
import toast from 'react-hot-toast';
import { getCurrentLocation, calculateDistance } from '../utils/geolocation';
import { useLang } from '../context/LanguageContext';

const Search = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'newest'

  // Modal and requesting state
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // Photo-based search (take/upload a photo of the medicine box)
  const [scanning, setScanning] = useState(false);
  const photoInputRef = useRef(null);

  const handlePhotoSearch = async (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setScanning(true);
    toast.loading(t('search.analyzing'), { id: 'photo-search' });
    try {
      const result = await identifyMedicineFromImage(file);
      if (!result || !result.name) {
        toast.error(t('search.photoReadError'), { id: 'photo-search' });
        return;
      }
      toast.success(t('search.recognized').replace('{name}', result.name), { id: 'photo-search' });
      setSearchTerm(result.name);
      fetchResults(result.name);
    } catch (error) {
      console.error('Photo search error:', error);
      toast.error(getApiError(error, t('search.photoAnalyzeError')), { id: 'photo-search' });
    } finally {
      setScanning(false);
    }
  };

  const fetchResults = async (query = '') => {
    setLoading(true);
    try {
      // 1. Get user location first
      let coords = userLocation;
      if (!coords) {
        try {
          coords = await getCurrentLocation();
          setUserLocation(coords);
          // Reverse-geocode the user's city for display
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=ar`)
            .then(res => res.json())
            .then(data => {
              const a = data?.address || {};
              const city = a.city || a.town || a.county || a.state || '';
              const suburb = a.suburb || a.neighbourhood || a.district || '';
              const formatted = [suburb, city].filter(Boolean).join('، ');
              if (formatted) setLocationName(formatted);
            })
            .catch(() => {});
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
      toast.error(getApiError(error, t('search.fetchError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(searchParams.get('q') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchResults(searchTerm);
    }
  };

  const handleOpenDetails = (med) => {
    setSelectedMedicine(med);
    setRequestMsg(t('search.requestMsgPrefill').replace('{name}', med.name));
  };

  const handleRequestMedicine = async () => {
    if (!selectedMedicine || !selectedMedicine.donor_id) {
      toast.error(t('search.donorDataIncomplete'));
      return;
    }

    if (currentUser && currentUser.id === selectedMedicine.donor_id) {
      toast.error(t('search.cantRequestOwn'));
      return;
    }

    setSendingRequest(true);
    try {
      // Send message to initiate chat
      await sendInboxMessage({
        receiver_id: selectedMedicine.donor_id,
        text: requestMsg
      });
      toast.success(t('search.requestSent'));
      setSelectedMedicine(null);
      // Navigate to inbox with query params to focus on this chat
      navigate(`/inbox?userId=${selectedMedicine.donor_id}&userName=${encodeURIComponent(selectedMedicine.donor_name || t('search.donorFallback'))}`);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, t('search.requestSendError')));
    } finally {
      setSendingRequest(false);
    }
  };

  const isFree = (r) => r.price === 'مجاني' || r.price === 0 || r.type === 'مجاني';

  const categories = [
    { name: 'الكل', label: t('common.all'), match: () => true },
    { name: 'مجاني', label: t('search.free'), match: (r) => isFree(r) },
    { name: 'بمقابل', label: t('search.paid'), match: (r) => !isFree(r) },
    { name: 'قريب الانتهاء', label: t('search.nearExpiry'), match: (r) => r.is_near_expiry },
  ].map((cat) => ({ ...cat, count: results.filter(cat.match).length }));

  const activeMatch = categories.find((c) => c.name === activeCategory)?.match || (() => true);

  const displayed = [...results.filter(activeMatch)].sort((a, b) => {
    if (sortBy === 'nearest') {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    }
    // newest first
    return new Date(b.added_at || 0) - new Date(a.added_at || 0);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow group w-full">
            <div className="absolute start-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full h-16 ps-14 pe-24 bg-white border border-slate-100 rounded-[1.25rem] shadow-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-700"
            />
            <div className="absolute end-3 top-1/2 -translate-y-1/2 flex gap-2">
               <input
                 ref={photoInputRef}
                 type="file"
                 accept="image/*"
                 capture="environment"
                 onChange={handlePhotoSearch}
                 className="hidden"
               />
               <button
                 type="button"
                 onClick={() => photoInputRef.current?.click()}
                 disabled={scanning}
                 title={t('search.photoTitle')}
                 className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all disabled:opacity-60 disabled:cursor-wait"
               >
                  {scanning
                    ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    : <Camera size={18} />}
               </button>
               <button onClick={() => fetchResults(searchTerm)} className="btn-primary h-10 px-5 text-sm">{t('search.searchBtn')}</button>
            </div>
          </div>
          <div className="h-16 px-8 glass-card flex items-center gap-3 text-slate-600 font-black text-sm shrink-0">
             <MapPin size={18} className="text-primary-500" />
             {locationName || t('search.currentLocation')}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => {
            const active = cat.name === activeCategory;
            return (
              <button
                key={i}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
                  active
                  ? 'bg-primary-950 text-white border-primary-950 shadow-lg shadow-primary-900/20'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-primary-200 hover:text-slate-600'
                }`}
              >
                {cat.label}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Controls */}
      <section className="flex items-center justify-between border-b border-slate-100 pb-6">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">{t('search.availableResults')}</h2>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">{t('search.liveUpdate')}</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setView('grid')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}><Grid size={18} /></button>
               <button onClick={() => setView('list')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}><ListIcon size={18} /></button>
            </div>
            <button
               onClick={() => setSortBy(sortBy === 'nearest' ? 'newest' : 'nearest')}
               className="h-12 px-5 glass-card flex items-center gap-2 text-xs font-black text-slate-600 hover:text-primary-600 transition-all"
            >
               <SlidersHorizontal size={16} />
               {sortBy === 'nearest' ? t('search.sortNearest') : t('search.sortNewest')}
            </button>
         </div>
      </section>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('search.fetching')}</p>
        </div>
      ) : displayed.length > 0 ? (
        <motion.div
          layout
          className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          <AnimatePresence>
            {displayed.map((item, i) => (
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
           <h3 className="text-xl font-black text-slate-800 mb-2">{t('search.noResultsTitle')}</h3>
           <p className="text-slate-400 max-w-xs mx-auto text-sm">{t('search.noResultsDesc')}</p>
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="flex justify-center pt-8">
        <button className="h-14 px-10 border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">{t('search.loadMore')}</button>
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
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('search.detailsTitle')}</h3>
                <button onClick={() => setSelectedMedicine(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 text-start">
                <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl">💊</div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800">{selectedMedicine.name}</h2>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                      selectedMedicine.price === 'مجاني' || selectedMedicine.price === 0
                        ? 'bg-red-50 text-red-600'
                        : 'bg-primary-50 text-primary-600'
                    }`}>
                      {selectedMedicine.price === 'مجاني' || selectedMedicine.price === 0 ? t('search.freeHeart') : `${selectedMedicine.price} ${t('common.currency')}`}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400">{selectedMedicine.generic_name || t('search.genericNotRegistered')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">{t('search.expiryDate')}</p>
                    <p className="text-slate-800 font-black">{selectedMedicine.expiry_date}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">{t('search.availableQty')}</p>
                    <p className="text-slate-800 font-black">{selectedMedicine.quantity}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 col-span-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">{t('search.location')}</p>
                    <p className="text-slate-800 font-black flex items-center gap-2">
                      <MapPin size={12} className="text-primary-500" />
                      {selectedMedicine.location}
                      {selectedMedicine.distance && (
                        <span className="text-primary-600 font-black">{t('search.awayKm').replace('{distance}', selectedMedicine.distance)}</span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedMedicine.batch_info && (
                  <div className="p-4 border border-slate-100 rounded-2xl text-xs font-bold">
                    <span className="text-slate-400">{t('search.batchNo')}</span>
                    <span className="text-slate-800 font-black">{selectedMedicine.batch_info}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-black text-slate-800">{t('search.publisherData')}</h4>
                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black">
                      {(selectedMedicine.donor_name || 'م').slice(0, 1)}
                    </div>
                    <div className="text-start space-y-1">
                      <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                        {selectedMedicine.donor_name || t('search.donorGoodFallback')}
                        {selectedMedicine.donor_verified && <VerifiedBadge size={13} label="" />}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {selectedMedicine.donor_role === 'pharmacy' ? t('search.sharingPharmacy') : t('search.individualDonor')}
                      </p>
                      <RatingStars rating={selectedMedicine.donor_rating} count={selectedMedicine.donor_rating_count} />
                    </div>
                  </div>
                </div>

                {/* Request form submission */}
                {currentUser && currentUser.id !== selectedMedicine.donor_id ? (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('search.contactMsg')}</label>
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
                      {sendingRequest ? t('search.contacting') : t('search.requestAndContact')}
                    </button>
                  </div>
                ) : currentUser ? (
                  <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl text-center text-xs font-bold">
                    {t('search.ownDonation')}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-center text-xs font-bold">
                    {t('search.loginToRequest')}
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
