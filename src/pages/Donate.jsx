import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Info, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Package, 
  Tag, 
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
  PlusCircle,
  ScanLine
} from 'lucide-react';
import { donateMedicine, getApiError } from '../api';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../utils/geolocation';
import { useLang } from '../context/LanguageContext';
import MedicineScanner from '../components/MedicineScanner';
import BarcodeScanner from '../components/BarcodeScanner';
import LocationPickerMap from '../components/LocationPickerMap';

const Donate = () => {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: '',
    generic_name: '',
    quantity: '',
    expiry_date: '',
    location: '',
    latitude: null,
    longitude: null,
    is_near_expiry: false,
    batch_info: '',
    manufacturer: '',
    barcode: '',
    price: 'مجاني'
  });

  useEffect(() => {
    getCurrentLocation().then(coords => {
      setFormData(prev => ({ ...prev, ...coords }));
      
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
              setFormData(prev => ({ ...prev, location: formatted }));
            }
          }
        }).catch(err => console.warn("Reverse geocode error:", err));
    }).catch(e => console.warn("Location not provided"));
  }, []);

  const [deliveryMethod, setDeliveryMethod] = useState(null); // 'pharmacy' | 'direct'
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTab, setScannerTab] = useState('camera');
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  const openScanner = (tab) => {
    setScannerTab(tab);
    setScannerOpen(true);
  };

  // The MedicineScanner has already run the recognition pipeline and let the
  // user confirm/edit — here we just apply the confirmed result and advance.
  const handleScanResult = (r) => {
    setFormData(prev => ({
      ...prev,
      medicine_name: r.name || prev.medicine_name,
      generic_name: r.generic_name || prev.generic_name,
      expiry_date: r.expiry_date || prev.expiry_date,
      manufacturer: r.manufacturer || prev.manufacturer,
    }));
    if (r.name) toast.success(t('donate.ocrRecognized').replace('{name}', r.name));
    setStep(2);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleDonate = async () => {
    setIsSubmitting(true);
    try {
      await donateMedicine(formData);
      setStep(5); // Success state
    } catch (error) {
      console.error("Donation error:", error);
      toast.error(getApiError(error, t('donate.submitError')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: t('donate.step1Title'), sub: t('donate.step1Sub') },
    { id: 2, title: t('donate.step2Title'), sub: t('donate.step2Sub') },
    { id: 3, title: t('donate.step3Title'), sub: t('donate.step3Sub') },
    { id: 4, title: t('donate.step4Title'), sub: t('donate.step4Sub') },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Progress Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-2">{t('donate.pageTitle')}</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">{t('donate.pageSub')}</p>

        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 start-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 start-0 h-0.5 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-4 ${
                  step === s.id 
                  ? 'bg-primary-950 text-white border-primary-100 scale-110 shadow-xl' 
                  : step > s.id 
                  ? 'bg-primary-500 text-white border-primary-50' 
                  : 'bg-white text-slate-300 border-slate-50'
                }`}
              >
                {step > s.id ? <CheckCircle2 size={24} /> : s.id}
              </div>
              <div className="hidden sm:block absolute top-16 whitespace-nowrap">
                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-slate-800' : 'text-slate-300'}`}>
                  {s.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Form Content */}
      <div className="glass-card p-10 relative overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
              <div className="text-start space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">{t('donate.captureHeading')}</h2>
                 <p className="text-slate-500">{t('donate.captureDesc')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                 <button type="button" onClick={() => openScanner('camera')} className="aspect-square rounded-3xl border-4 border-dashed border-primary-100 bg-primary-50/30 flex flex-col items-center justify-center gap-4 group transition-all cursor-pointer hover:bg-primary-50">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-xl shadow-primary-200/50 group-hover:scale-110 transition-transform">
                       <Camera size={32} />
                    </div>
                    <span className="font-black text-primary-700">{t('donate.openCamera')}</span>
                 </button>
                 <button type="button" onClick={() => openScanner('upload')} className="aspect-square rounded-3xl border-4 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center gap-4 group transition-all font-bold text-slate-400 cursor-pointer hover:bg-slate-50">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-100 transition-transform group-hover:scale-110">
                       <Upload size={32} />
                    </div>
                    <span>{t('donate.uploadFromDevice')}</span>
                 </button>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl flex gap-4 text-start border border-amber-100">
                 <Info className="text-amber-600 shrink-0" size={24} />
                 <p className="text-sm text-amber-800 leading-relaxed font-medium">{t('donate.tip')}</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
              <div className="text-start space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">{t('donate.confirmHeading')}</h2>
                 <p className="text-slate-500">{t('donate.confirmDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-start">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('donate.tradeName')}</label>
                    <input 
                      type="text" 
                      value={formData.medicine_name}
                      onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('donate.genericName')}</label>
                    <input 
                      type="text" 
                      value={formData.generic_name}
                      onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('donate.manufacturer')}</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      placeholder={t('donate.manufacturerPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('donate.barcode')}</label>
                    <div className="flex gap-2">
                       <input
                          type="text"
                          value={formData.barcode}
                          onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                          placeholder={t('donate.barcodePlaceholder')}
                          className="flex-grow bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800"
                       />
                       <button
                          type="button"
                          onClick={() => setBarcodeOpen(true)}
                          title={t('barcode.title')}
                          className="shrink-0 w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
                       >
                          <ScanLine size={22} />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" size={20} />
                 <span className="text-sm font-black text-emerald-800">{t('donate.safeBadge')}</span>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-grow"
            >
               <div className="text-start space-y-2">
                 <h2 className="text-2xl font-black text-slate-800">{t('donate.qtyHeading')}</h2>
                 <p className="text-slate-500">{t('donate.qtyDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 text-start">
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2 flex items-center gap-2">
                          <Calendar size={14} className="text-primary-500" /> {t('donate.expiryLabel')}
                        </label>
                        <input 
                          type="month" 
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2 flex items-center gap-2">
                           <Package size={14} className="text-primary-500" /> {t('donate.totalQtyLabel')}
                        </label>
                        <div className="flex gap-4">
                           <input
                             type="text"
                             placeholder={t('donate.qtyPlaceholder')}
                             value={formData.quantity}
                             onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                             className="flex-grow bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:border-primary-500 transition-all font-bold text-slate-800" 
                           />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                         <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 checked={formData.is_near_expiry}
                                 onChange={(e) => setFormData({...formData, is_near_expiry: e.target.checked})}
                                 className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary-500 focus:ring-primary-500"
                               />
                               <span className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{t('donate.nearExpiryLabel')}</span>
                            </label>
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ps-1">{t('donate.batchLabel')}</label>
                            <input
                              type="text"
                              value={formData.batch_info}
                              onChange={(e) => setFormData({...formData, batch_info: e.target.value})}
                              placeholder={t('donate.batchPlaceholder')}
                              className="w-full bg-slate-50 border border-slate-200 h-14 ps-6 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm"
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">💊</div>
                      <div className="space-y-1">
                         <h4 className="text-lg font-black text-slate-800">{t('donate.coatedTablets')}</h4>
                         <p className="text-xs font-bold text-slate-400">{t('donate.coatedNote')}</p>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 flex-grow"
            >
               <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-fade-in">✅</div>
                 <h2 className="text-2xl font-black text-slate-800">{t('donate.readyHeading')}</h2>
                 <p className="text-slate-500 max-w-sm mx-auto">{t('donate.readyDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-start">
                  <button
                     onClick={() => setDeliveryMethod('pharmacy')}
                     className={`p-8 rounded-3xl border-2 transition-all group text-start space-y-2 ${
                       deliveryMethod === 'pharmacy'
                       ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10'
                       : 'border-primary-100 bg-primary-50/20 hover:bg-primary-50'
                     }`}
                  >
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 mb-4 transition-transform group-hover:scale-110">
                        <MapPin size={24} />
                     </div>
                     <h3 className="font-black text-primary-900 flex items-center gap-2">
                        {t('donate.nearestPharmacy')}
                        {deliveryMethod === 'pharmacy' && <CheckCircle2 size={16} className="text-primary-600" />}
                     </h3>
                     <p className="text-xs text-primary-700 font-medium leading-relaxed">{t('donate.nearestPharmacyDesc')}</p>
                  </button>

                  <button
                     onClick={() => setDeliveryMethod('direct')}
                     className={`p-8 rounded-3xl border-2 transition-all group text-start space-y-2 shadow-sm ${
                       deliveryMethod === 'direct'
                       ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10'
                       : 'border-slate-100 bg-white hover:bg-slate-50'
                     }`}
                  >
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4 transition-transform group-hover:scale-110">
                        <Users className="text-blue-500" size={24} />
                     </div>
                     <h3 className="font-black text-slate-800 flex items-center gap-2">
                        {t('donate.directDelivery')}
                        {deliveryMethod === 'direct' && <CheckCircle2 size={16} className="text-blue-600" />}
                     </h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed">{t('donate.directDeliveryDesc')}</p>
                  </button>
              </div>

              {deliveryMethod === 'direct' && (
                <div className="pt-2">
                  <LocationPickerMap
                    defaultLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                    onLocationSelect={(pos) => setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))}
                  />
                </div>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-5xl shadow-xl shadow-emerald-500/10">✨</div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">{t('donate.successHeading')}</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-bold">{t('donate.successDesc')}</p>
              </div>
              <div className="flex justify-center gap-4 pt-4">
                 <button onClick={() => setStep(1)} className="btn-primary h-14 px-8">{t('donate.donateNew')}</button>
                 <button onClick={() => window.location.href = '/dashboard'} className="btn-secondary h-14 px-8">{t('donate.dashboard')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-auto pt-12 flex justify-between gap-4">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`btn-secondary h-14 px-8 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowRight size={18} />
            {t('donate.prev')}
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="btn-primary h-14 px-10 shadow-primary-600/20"
            >
              {t('donate.nextStep')}
              <ArrowLeft size={18} />
            </button>
          ) : step === 4 ? (
            <button
              onClick={handleDonate}
              disabled={isSubmitting || !deliveryMethod}
              title={!deliveryMethod ? t('donate.chooseDeliveryFirst') : ''}
              className="btn-primary h-14 px-10 shadow-primary-600/20 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('donate.publishing') : !deliveryMethod ? t('donate.chooseDelivery') : t('donate.confirmPublish')}
              <CheckCircle2 size={18} />
            </button>
          ) : (
            <button
              onClick={() => { setStep(1); }}
              className="btn-primary h-14 px-10 shadow-primary-600/20"
            >
              {t('donate.donateAnother')}
              <PlusCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Safety Footer */}
      <footer className="mt-12 flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('donate.encryptedData')}</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-slate-300"></div>
         <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-primary-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('donate.medicalSupervision')}</span>
         </div>
      </footer>

      {/* Camera + upload medicine recognition */}
      <MedicineScanner
        open={scannerOpen}
        initialTab={scannerTab}
        onClose={() => setScannerOpen(false)}
        onConfirm={handleScanResult}
      />

      {/* Barcode scanner for the barcode field */}
      {barcodeOpen && (
        <BarcodeScanner
          onScan={(code) => { setFormData(prev => ({ ...prev, barcode: code })); setBarcodeOpen(false); toast.success(code); }}
          onClose={() => setBarcodeOpen(false)}
        />
      )}
    </div>
  );
};

export default Donate;
