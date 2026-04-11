import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Layers, Focus, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';
import { getInventory, getEmergencyBoard } from '../api';
import { getCurrentLocation } from '../utils/geolocation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons not showing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center = { lat: 30.0444, lng: 31.2357 };

const MapUpdater = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], map.getZoom());
    }
  }, [coords, map]);
  return null;
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState('جاري تحديد الموقع...');
  const [userCoords, setUserCoords] = useState(center);

  useEffect(() => {
    // 1. Get User Location
    getCurrentLocation().then(coords => {
      setUserCoords({ lat: coords.latitude, lng: coords.longitude });
      setUserLocation('موقعك الحالي');
    }).catch(() => {
      setUserLocation('القاهرة، مصر');
    });

    // 2. Fetch Data for Markers
    const fetchData = async () => {
      try {
        const [invRes, sosRes] = await Promise.all([getInventory(), getEmergencyBoard()]);
        
        // Transform some data into map markers (simulated placement for mock map)
        // Adding some random offsets to coordinates for mock testing
        const meds = invRes.data.slice(0, 3).map((m, i) => ({
          lat: userCoords.lat + (Math.random() - 0.5) * 0.1,
          lng: userCoords.lng + (Math.random() - 0.5) * 0.1,
          name: m.name,
          type: 'مجاني'
        }));

        const sos = sosRes.data.slice(0, 2).map((s, i) => ({
          lat: userCoords.lat + (Math.random() - 0.5) * 0.1,
          lng: userCoords.lng + (Math.random() - 0.5) * 0.1,
          name: s.medicine_name,
          type: 'طلب عاجل'
        }));

        setMarkers([...meds, ...sos]);
      } catch (e) {
        console.error("Map data fetch error:", e);
      }
    };

    fetchData();
  }, [userCoords.lat, userCoords.lng]);

  const DefaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const EmergencyIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const FreeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
      <div className="flex-grow glass-card relative overflow-hidden bg-slate-100 border-none shadow-inner p-0 rounded-3xl z-0">
        <MapContainer 
          center={[userCoords.lat, userCoords.lng]} 
          zoom={13} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapUpdater coords={userCoords} />

          {/* User Marker */}
          <Marker position={[userCoords.lat, userCoords.lng]} icon={DefaultIcon}>
            <Popup>
              <div className="text-right font-bold font-cairo">موقعك الحالي</div>
            </Popup>
          </Marker>

          {/* Item Markers */}
          {markers.map((med, i) => (
            <Marker
              key={i}
              position={[med.lat, med.lng]}
              icon={med.type === 'طلب عاجل' ? EmergencyIcon : FreeIcon}
            >
              <Popup>
                <div className="text-right p-1 text-slate-800 font-cairo" dir="rtl">
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${med.type === 'طلب عاجل' ? 'text-red-500' : 'text-emerald-500'}`}>{med.type}</p>
                  <p className="text-sm font-black mt-1">{med.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl max-w-xs text-right">
           <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">دلائل الخريطة</h4>
           <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                 <span>أدوية متوفرة مجاناً</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                 <span>حالات استغاثة فورية</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span>موقعك الحالي</span>
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
