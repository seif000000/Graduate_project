import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Layers, Focus, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';
import { getInventory, getEmergencyBoard } from '../api';
import { getCurrentLocation } from '../utils/geolocation';

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState('جاري تحديد الموقع...');
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    // 1. Get User Location
    getCurrentLocation().then(coords => {
      setUserCoords(coords);
      setUserLocation('القاهرة، المعادي (موقعك الحالي)');
    }).catch(() => {
      setUserLocation('القاهرة، مصر');
    });

    // 2. Fetch Data for Markers
    const fetchData = async () => {
      try {
        const [invRes, sosRes] = await Promise.all([getInventory(), getEmergencyBoard()]);
        
        // Transform some data into map markers (simulated placement for mock map)
        const meds = invRes.data.slice(0, 3).map((m, i) => ({
          top: `${30 + (i * 15)}%`,
          right: `${20 + (i * 20)}%`,
          name: m.name,
          type: 'مجاني'
        }));

        const sos = sosRes.data.slice(0, 2).map((s, i) => ({
          top: `${50 + (i * 20)}%`,
          right: `${60 - (i * 10)}%`,
          name: s.medicine_name,
          type: 'طلب عاجل'
        }));

        setMarkers([...meds, ...sos]);
      } catch (e) {
        console.error("Map data fetch error:", e);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6" dir="rtl">
      {/* Search & Stats Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
        <div className="lg:col-span-3 glass-card p-4 flex items-center gap-4">
           <div className="flex-grow relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن مكان أو دواء على الخريطة..." 
                className="w-full bg-slate-50 border border-slate-200 h-12 pr-12 pl-4 rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
              />
           </div>
           <button className="btn-primary h-12 px-6 text-sm">تحديث النتائج</button>
        </div>
        <div className="glass-card p-4 flex items-center justify-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <MapPin size={20} />
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">موقعي الحالي</p>
              <p className="text-sm font-black text-slate-800">{userLocation}</p>
           </div>
        </div>
      </div>

      {/* Map Content Container */}
      <div className="flex-grow glass-card relative overflow-hidden bg-slate-100 border-none shadow-inner">
        {/* Mock Map Background (Stylized) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
           <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-500/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Dynamic Markers */}
        {markers.map((med, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            style={{ top: med.top, right: med.right }}
            className="absolute group z-10"
          >
            <div className="relative">
              <div className={`p-3 rounded-2xl shadow-xl border-2 border-white backdrop-blur-md flex items-center gap-3 transition-all group-hover:-translate-y-2 cursor-pointer ${med.type === 'طلب عاجل' ? 'bg-red-500 text-white' : 'bg-white text-slate-800'}`}>
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${med.type === 'طلب عاجل' ? 'bg-white/20' : 'bg-primary-50'}`}>
                    {med.type === 'طلب عاجل' ? '🚨' : '💊'}
                 </div>
                 <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none opacity-60`}>{med.type}</p>
                    <p className="text-sm font-black leading-tight">{med.name}</p>
                 </div>
              </div>
              <div className={`absolute -bottom-1 right-1/2 translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 border-white ${med.type === 'طلب عاجل' ? 'bg-red-500' : 'bg-white'}`}></div>
            </div>
          </motion.div>
        ))}

        {/* Map Controls */}
        <div className="absolute left-6 top-6 flex flex-col gap-2 z-20">
           <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"><ZoomIn size={20} /></button>
           <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"><ZoomOut size={20} /></button>
           <div className="h-4"></div>
           <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"><Focus size={20} /></button>
           <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"><Layers size={20} /></button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl max-w-xs text-right">
           <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">دلائل الخريطة</h4>
           <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                 <span>أدوية متوفرة مجاناً</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                 <span>حالات استغاثة فورية</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <span>صيدليات مشاركة</span>
              </div>
           </div>
        </div>

        {/* Navigation Prompt */}
        <div className="absolute bottom-6 right-6 z-20">
           <button className="btn-primary gap-3 rounded-full px-8 shadow-2xl">
              <Navigation size={18} />
              ابدأ التتبع الملاحي
           </button>
        </div>
      </div>
    </div>
  );
};

export default Map;
