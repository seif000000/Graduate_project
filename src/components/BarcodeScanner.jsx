import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      onScan(decodedText);
      scanner.clear();
    }, (error) => {
      // Handle error or just ignore
    });

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">ماسح الباركود</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div id="reader" className="rounded-2xl overflow-hidden border-2 border-primary-100"></div>
          <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
            ضع باركود علبة الدواء داخل الإطار ليتم التعرف عليه تلقائياً.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
