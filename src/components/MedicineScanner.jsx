import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw, Check, Loader2, AlertTriangle } from 'lucide-react';
import { identifyMedicineFromImage } from '../services/gemini';
import { useLang } from '../context/LanguageContext';

/**
 * MedicineScanner — identify a medicine from a photo.
 *
 * Two capture methods, one recognition pipeline:
 *   1. Live camera (getUserMedia, rear camera on mobile, webcam on desktop)
 *   2. Upload an image from the device
 * Both feed identifyMedicineFromImage() (backend Vision → direct fallback),
 * then show the detected name + confidence and let the user confirm/edit
 * before the result is returned via onConfirm().
 *
 * Props:
 *  - open: boolean
 *  - onClose(): void
 *  - onConfirm(result): void   result = {name, generic_name, expiry_date, strength, manufacturer, description, confidence}
 *  - confirmLabel?: string     override the confirm button text (e.g. "Confirm & search")
 */
export default function MedicineScanner({ open, onClose, onConfirm, confirmLabel, initialTab = 'camera' }) {
  const { t } = useLang();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [tab, setTab] = useState(initialTab); // 'camera' | 'upload'
  const [camError, setCamError] = useState(null); // 'denied' | 'error' | null
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // identified medicine or null
  const [form, setForm] = useState({ name: '', generic_name: '', expiry_date: '' });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      setCamError(e?.name === 'NotAllowedError' ? 'denied' : 'error');
    }
  }, []);

  // Start/stop the camera as the modal opens, the tab changes, or a result appears.
  useEffect(() => {
    if (open && tab === 'camera' && !result && !analyzing) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, tab, result, analyzing, startCamera, stopCamera]);

  // Reset everything each time the modal opens/closes.
  useEffect(() => {
    setResult(null);
    setAnalyzing(false);
    setCamError(null);
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const processFile = async (file) => {
    if (!file) return;
    stopCamera();
    setAnalyzing(true);
    try {
      const data = (await identifyMedicineFromImage(file)) || {};
      setResult(data);
      setForm({
        name: data.name || '',
        generic_name: data.generic_name || '',
        expiry_date: data.expiry_date || '',
      });
    } catch {
      // Recognition failed — still let the user type the details manually.
      setResult({ name: null, confidence: 0, _error: true });
      setForm({ name: '', generic_name: '', expiry_date: '' });
    } finally {
      setAnalyzing(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => blob && processFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' })),
      'image/jpeg',
      0.9
    );
  };

  const retake = () => {
    setResult(null);
    setAnalyzing(false);
  };

  const confirm = () => {
    if (!form.name.trim()) return;
    onConfirm?.({
      name: form.name.trim(),
      generic_name: form.generic_name.trim() || null,
      expiry_date: form.expiry_date.trim() || null,
      strength: result?.strength || null,
      manufacturer: result?.manufacturer || null,
      description: result?.description || null,
      confidence: result?.confidence ?? 0,
    });
    onClose?.();
  };

  if (!open) return null;

  const confidence = result?.confidence ?? 0;
  const confText = confidence >= 70 ? 'text-emerald-600' : confidence >= 40 ? 'text-amber-600' : 'text-red-500';
  const confBar = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const recognized = result && result.name && !result._error;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Camera size={18} className="text-primary-600" /> {t('scanner.title')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {result ? (
            /* ---------- confirm / edit ---------- */
            <div className="space-y-4">
              {recognized ? (
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('scanner.detected')}</p>
                  <p className="text-xl font-black text-slate-800">{result.name}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-black mb-1">
                      <span className="text-slate-500">{t('scanner.confidence')}</span>
                      <span className={confText}>{confidence}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${confBar} transition-all`} style={{ width: `${confidence}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl p-3 text-sm font-bold">
                  <AlertTriangle size={16} /> {t('scanner.notRecognized')}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-black text-slate-500 block mb-1">{t('scanner.nameLabel')}</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-500 block mb-1">{t('scanner.genericLabel')}</label>
                  <input
                    value={form.generic_name}
                    onChange={(e) => setForm((f) => ({ ...f, generic_name: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-primary-400"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="flex-1 h-12 rounded-xl border border-slate-200 font-black text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <RefreshCw size={16} /> {t('scanner.retake')}
                </button>
                <button
                  onClick={confirm}
                  disabled={!form.name.trim()}
                  className="flex-1 h-12 rounded-xl bg-primary-600 text-white font-black flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Check size={16} /> {confirmLabel || t('scanner.confirm')}
                </button>
              </div>
            </div>
          ) : analyzing ? (
            /* ---------- analyzing ---------- */
            <div className="py-16 flex flex-col items-center gap-4 text-slate-500">
              <Loader2 size={40} className="animate-spin text-primary-500" />
              <p className="font-bold">{t('scanner.analyzing')}</p>
            </div>
          ) : (
            /* ---------- capture / upload ---------- */
            <div className="space-y-4">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setTab('camera')}
                  className={`flex-1 h-10 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    tab === 'camera' ? 'bg-white text-primary-600 shadow' : 'text-slate-500'
                  }`}
                >
                  <Camera size={16} /> {t('scanner.tabCamera')}
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className={`flex-1 h-10 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    tab === 'upload' ? 'bg-white text-primary-600 shadow' : 'text-slate-500'
                  }`}
                >
                  <Upload size={16} /> {t('scanner.tabUpload')}
                </button>
              </div>

              {tab === 'camera' ? (
                camError ? (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 text-center space-y-3">
                    <AlertTriangle className="mx-auto text-amber-500" size={30} />
                    <p className="text-sm font-bold text-amber-700">
                      {t(camError === 'denied' ? 'scanner.cameraDenied' : 'scanner.cameraError')}
                    </p>
                    <button
                      onClick={() => setTab('upload')}
                      className="h-10 px-5 rounded-xl bg-amber-500 text-white font-black text-sm inline-flex items-center gap-2"
                    >
                      <Upload size={15} /> {t('scanner.tabUpload')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
                      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={capture}
                      className="w-full h-12 rounded-xl bg-primary-600 text-white font-black flex items-center justify-center gap-2 hover:bg-primary-700"
                    >
                      <Camera size={18} /> {t('scanner.capture')}
                    </button>
                  </>
                )
              ) : (
                <label className="block rounded-2xl border-4 border-dashed border-primary-100 bg-primary-50/40 p-8 text-center cursor-pointer hover:bg-primary-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      processFile(f);
                    }}
                  />
                  <Upload className="mx-auto text-primary-500 mb-3" size={32} />
                  <p className="font-black text-primary-700">{t('scanner.chooseFile')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('scanner.uploadPrompt')}</p>
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
