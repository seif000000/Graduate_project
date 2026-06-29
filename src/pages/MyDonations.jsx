import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Package, Clock, CheckCircle, XCircle, Trash2, MapPin, Search, X, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { getMyDonations, deleteDonation, getApiError } from '../api';
import toast from 'react-hot-toast';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and Donation form states
  const [showDonateTypeModal, setShowDonateTypeModal] = useState(false);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, vodafone, fawry
  const [paymentPhone, setPaymentPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchDonations = async () => {
    try {
      const res = await getMyDonations();
      setDonations(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل التبرعات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التبرع؟')) {
      try {
        await deleteDonation(id);
        setDonations(donations.filter(d => d.id !== id));
      } catch (e) {
        toast.error(getApiError(e, 'حدث خطأ أثناء الحذف'));
      }
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      toast.success("تم استلام تبرعك المالي بنجاح! شكراً لك ❤️");
    }, 2000);
  };

  const resetPaymentForm = () => {
    setShowMoneyModal(false);
    setPaymentSuccess(false);
    setDonationAmount('100');
    setCustomAmount('');
    setPaymentMethod('card');
    setPaymentPhone('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'delivered': return { label: 'تم التسليم', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' };
      case 'reserved': return { label: 'محجوز', icon: Clock, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' };
      default: return { label: 'متوفر', icon: Package, color: 'text-primary-600 bg-primary-50', border: 'border-primary-100' };
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <Heart className="text-red-600" size={40} />
            تبرعاتي
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة ومتابعة الأدوية التي قمت بالتبرع بها</p>
        </div>
        <button 
          onClick={() => setShowDonateTypeModal(true)}
          className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20"
        >
          + تبرع بمبالغ أو دواء
        </button>
      </header>

      {donations.length === 0 && !loading ? (
        <div className="glass-card p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl opacity-50">🎁</div>
           <h3 className="text-xl font-black text-slate-800">لا يوجد تبرعات بعد</h3>
           <p className="text-slate-400 font-bold">ابدأ بنشر أول تبرع لك وساعد الآخرين!</p>
           <button 
             onClick={() => setShowDonateTypeModal(true)}
             className="btn-primary px-8 h-12"
           >
             تبرع بمبالغ أو دواء
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {donations.map((don, i) => {
            const status = getStatusInfo(don.status);
            return (
              <motion.div
                key={don.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-0 overflow-hidden border-transparent hover:border-primary-200 transition-all flex flex-col md:flex-row group"
              >
                 <div className={`w-2 shrink-0 ${status.color.split(' ')[1].replace('-50', '-500')}`} />
                 
                 <div className="flex-grow p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-6 items-start text-right w-full md:w-auto">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          💊
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800">{don.name}</h3>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                             <MapPin size={12} className="text-primary-500" />
                             {don.location}
                          </p>
                          <p className="text-[10px] font-black text-slate-300">الكمية: {don.quantity} | تاريخ الانتهاء: {don.expiry_date}</p>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                       <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border ${status.color} ${status.border}`}>
                          <status.icon size={14} />
                          {status.label}
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleDelete(don.id)}
                            className="h-10 px-6 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Donation Type Selection Modal */}
      <AnimatePresence>
        {showDonateTypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDonateTypeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">اختر نوع التبرع 🎁</h3>
                <button onClick={() => setShowDonateTypeModal(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setShowDonateTypeModal(false);
                    window.location.href = '/donate';
                  }}
                  className="w-full p-6 bg-slate-50 hover:bg-primary-50/50 border border-slate-100 hover:border-primary-200 rounded-3xl flex items-center gap-4 transition-all text-right group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💊</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">تبرع بدواء فائض</h4>
                    <p className="text-xs text-slate-400 font-bold">تبرع بالدواء الزائد لديك لمريض يحتاجه.</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowDonateTypeModal(false);
                    setShowMoneyModal(true);
                  }}
                  className="w-full p-6 bg-slate-50 hover:bg-red-50/50 border border-slate-100 hover:border-red-200 rounded-3xl flex items-center gap-4 transition-all text-right group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💰</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">تبرع بمبالغ مالية</h4>
                    <p className="text-xs text-slate-400 font-bold">ادعم شراء أدوية الحالات الحرجة وغير القادرة.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Money Donation Simulation Modal */}
      <AnimatePresence>
        {showMoneyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetPaymentForm}
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
                <h3 className="text-xl font-black text-slate-800">التبرع المالي 💳</h3>
                <button onClick={resetPaymentForm} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              {!paymentSuccess ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-6 text-right">
                  {/* Select Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">حدد مبلغ التبرع</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['50', '100', '200', '500'].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setDonationAmount(amount);
                            setCustomAmount('');
                          }}
                          className={`h-12 rounded-2xl text-sm font-black border transition-all ${
                            donationAmount === amount && !customAmount
                              ? 'bg-primary-950 text-white border-primary-950 shadow-md shadow-primary-950/20'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {amount} ج.م
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="أدخل مبلغاً آخر..."
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setDonationAmount('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 mt-2 transition-all"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-2">طريقة الدفع</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'card', label: 'بطاقة ائتمان', icon: CreditCard },
                        { id: 'vodafone', label: 'فودافون كاش', icon: Wallet },
                        { id: 'fawry', label: 'فوري', icon: Wallet }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`h-16 rounded-2xl text-xs font-black border flex flex-col items-center justify-center gap-1 transition-all ${
                            paymentMethod === method.id
                              ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <method.icon size={18} />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment inputs depending on method */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                      <motion.div
                        key="card-fields"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 pr-2">رقم البطاقة</label>
                          <input
                            type="text"
                            required
                            placeholder="1234 5678 1234 5678"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                            maxLength={19}
                            className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-left"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 pr-2">تاريخ الانتهاء</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={e => setCardExpiry(e.target.value)}
                              maxLength={5}
                              className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-center"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 pr-2">الرمز (CVV)</label>
                            <input
                              type="password"
                              required
                              placeholder="***"
                              value={cardCvv}
                              onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              maxLength={3}
                              className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-center"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {(paymentMethod === 'vodafone' || paymentMethod === 'fawry') && (
                      <motion.div
                        key="phone-fields"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold text-slate-500 pr-2">رقم الهاتف المحمول للمحفظة</label>
                        <input
                          type="tel"
                          required
                          placeholder="01xxxxxxxxx"
                          value={paymentPhone}
                          onChange={e => setPaymentPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-left"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-3 text-base"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري معالجة عملية التبرع...</span>
                      </>
                    ) : (
                      <span>تبرع الآن بمبلغ {customAmount || donationAmount} ج.م ❤️</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">🎉</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800">شكراً جزيلاً لتبرعك!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-bold">
                      تم استلام تبرعك بقيمة <span className="text-emerald-600">{customAmount || donationAmount} ج.م</span> بنجاح. سيتم توجيه هذا المبلغ فوراً لشراء أدوية الحالات الحرجة.
                    </p>
                  </div>
                  <button
                    onClick={resetPaymentForm}
                    className="btn-primary h-12 px-8 rounded-2xl mx-auto shadow-md"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyDonations;
