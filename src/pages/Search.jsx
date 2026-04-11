import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, MapPin, Grid, List as ListIcon, SlidersHorizontal, Camera, ChevronDown } from 'lucide-react';
import MedicineCard from '../components/MedicineCard';
import { getInventory } from '../api';
import { getCurrentLocation, calculateDistance } from '../utils/geolocation';

const Search = () => {
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

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

  const categories = [
    { name: 'الكل', count: results.length },
    { name: 'مجاني', count: results.filter(r => r.price === 'مجاني').length },
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
                <MedicineCard {...item} />
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
    </div>
  );
};

export default Search;
