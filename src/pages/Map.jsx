import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Layers, Focus, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';
import { getInventory, getEmergencyBoard, getApiError } from '../api';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../utils/geolocation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLang } from '../context/LanguageContext';

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

const MapActions = ({ userCoords }) => {
  const map = useMap();
  
  return (
    <div className="absolute end-6 top-6 flex flex-col gap-2 z-[400]">
       <button 
         onClick={() => map.zoomIn()}
         className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"
       >
         <ZoomIn size={20} />
       </button>
       <button 
         onClick={() => map.zoomOut()}
         className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"
       >
         <ZoomOut size={20} />
       </button>
       <div className="h-4"></div>
       <button 
         onClick={() => map.flyTo([userCoords.lat, userCoords.lng], 15)}
         className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all"
       >
         <Focus size={20} />
       </button>
       <button className="w-12 h-12 bg-primary-500 text-white backdrop-blur-md rounded-2xl shadow flex items-center justify-center hover:bg-primary-600 transition-all"><Layers size={20} /></button>
    </div>
  );
};

const Map = () => {
  const { t } = useLang();
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(t('map.locating'));
  const [userCoords, setUserCoords] = useState(center);

  // 1. Detect location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(coords => {
        const userLatLng = { lat: coords.latitude, lng: coords.longitude };
        setUserCoords(userLatLng);
        
        // Reverse geocode user location using OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=ar`)
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const address = data.address;
              const city = address.city || address.town || address.county || '';
              const suburb = address.suburb || address.neighbourhood || address.district || '';
              const formatted = [suburb, city].filter(Boolean).join('، ') || data.name || t('map.currentLocationFallback');
              setUserLocation(formatted);
            } else {
              setUserLocation(t('map.currentLocationFallback'));
            }
          })
          .catch(() => {
            setUserLocation(t('map.currentLocationFallback'));
          });
      })
      .catch(() => {
        setUserLocation(t('map.cairoEgypt'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fetch data for markers when userCoords is updated
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, sosRes] = await Promise.all([getInventory(), getEmergencyBoard()]);
        
        // Transform data into map markers with valid numeric coordinates or safe offsets
        const meds = invRes.data.slice(0, 10).map((m) => {
          const lat = m.latitude !== null && m.latitude !== undefined && m.latitude !== 0 ? parseFloat(m.latitude) : userCoords.lat + (Math.random() - 0.5) * 0.05;
          const lng = m.longitude !== null && m.longitude !== undefined && m.longitude !== 0 ? parseFloat(m.longitude) : userCoords.lng + (Math.random() - 0.5) * 0.05;
          return {
            lat,
            lng,
            name: m.name,
            type: 'مجاني'
          };
        });

        const sos = sosRes.data.slice(0, 5).map((s) => {
          const lat = s.latitude !== null && s.latitude !== undefined && s.latitude !== 0 ? parseFloat(s.latitude) : userCoords.lat + (Math.random() - 0.5) * 0.05;
          const lng = s.longitude !== null && s.longitude !== undefined && s.longitude !== 0 ? parseFloat(s.longitude) : userCoords.lng + (Math.random() - 0.5) * 0.05;
          return {
            lat,
            lng,
            name: s.medicine_name,
            type: 'طلب عاجل'
          };
        });

        setMarkers([...meds, ...sos]);
      } catch (e) {
        toast.error(getApiError(e, t('map.fetchError')));
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords]);

  const handleNavigation = () => {
    toast.success(t('map.navigating'));
    if (markers.length > 0) {
      // Find closest marker
      let closest = markers[0];
      let minD = Infinity;
      markers.forEach(m => {
        const d = Math.pow(m.lat - userCoords.lat, 2) + Math.pow(m.lng - userCoords.lng, 2);
        if (d < minD) {
          minD = d;
          closest = m;
        }
      });
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${closest.lat},${closest.lng}&travelmode=driving`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`, '_blank');
    }
  };

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
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      {/* Search & Stats Overlay - Lifted to top with z-index */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0 relative z-10">
        <div className="lg:col-span-3 glass-card p-4 flex items-center gap-4">
           <div className="flex-grow relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t('map.searchPlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 h-12 ps-12 pe-4 rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
              />
           </div>
           <button className="btn-primary h-12 px-6 text-sm">{t('map.refreshResults')}</button>
        </div>
        <div className="glass-card p-4 flex items-center justify-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <MapPin size={20} />
           </div>
           <div className="text-start">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('map.myCurrentLocation')}</p>
              <p className="text-sm font-black text-slate-800">{userLocation}</p>
           </div>
        </div>
      </div>

      {/* Map Content Container */}
      <div className="flex-grow glass-card relative overflow-hidden bg-slate-100 border-none shadow-inner p-0 rounded-[2rem] z-0">
        <MapContainer 
          center={[userCoords.lat, userCoords.lng]} 
          zoom={13} 
          className="w-full h-full rounded-[2rem] z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapUpdater coords={userCoords} />
          <MapActions userCoords={userCoords} />

          {/* User Marker */}
          <Marker position={[userCoords.lat, userCoords.lng]} icon={DefaultIcon}>
            <Popup>
              <div className="text-start font-bold font-cairo">{t('map.currentLocation')}</div>
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
                <div className="text-start p-1 text-slate-800 font-cairo">
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${med.type === 'طلب عاجل' ? 'text-red-500' : 'text-primary-500'}`}>{med.type === 'طلب عاجل' ? t('map.urgentRequest') : t('search.free')}</p>
                  <p className="text-sm font-black mt-1">{med.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Legend */}
          <div className="absolute bottom-6 end-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl max-w-xs text-start">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('map.legendTitle')}</h4>
             <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                   <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                   <span>{t('map.legendFree')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                   <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                   <span>{t('map.legendSos')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   <span>{t('map.legendMe')}</span>
                </div>
             </div>
          </div>

          {/* Navigation Prompt */}
          <div className="absolute bottom-6 start-6 z-[400]">
             <button
               onClick={handleNavigation}
               className="btn-primary gap-3 rounded-full px-8 shadow-2xl h-14 bg-emerald-600 hover:bg-emerald-700"
             >
                <Navigation size={18} />
                <span className="font-bold">{t('map.navTrack')}</span>
             </button>
          </div>

        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
