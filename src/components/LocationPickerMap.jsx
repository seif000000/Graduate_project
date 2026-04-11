import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

const center = { lat: 30.0444, lng: 31.2357 };

const DefaultIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A component to catch map clicks and move the marker
const LocationMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);
  
  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={DefaultIcon}
    >
      <Popup minWidth={90}>
        <div className="text-center font-cairo font-bold">الموقع المحدد للعنوان</div>
      </Popup>
    </Marker>
  )
}

const LocationPickerMap = ({ onLocationSelect, defaultLocation = null }) => {
  const [position, setPosition] = useState(defaultLocation || center);

  useEffect(() => {
    if (onLocationSelect && position) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="w-full text-right space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2 flex items-center gap-2 justify-end">
        حدد موقعك على الخريطة <MapPin size={14} className="text-primary-500" />
      </label>
      <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-100 z-0 relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      <p className="text-[10px] text-slate-500 font-bold">يمكنك سحب العلامة الزرقاء لتغيير الموقع بدقة.</p>
    </div>
  );
};

export default LocationPickerMap;
