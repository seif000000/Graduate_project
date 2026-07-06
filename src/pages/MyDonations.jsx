import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Package, Clock, CheckCircle, XCircle, Trash2, MapPin, Search, X, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { getMyDonations, deleteDonation, getApiError } from '../api';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';

const MyDonations = () => {
  const { t } = useLang();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and Donation form states
  const [showDonateTypeModal, setShowDonateTypeModal] = useState(false);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // donation ID

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
      toast.error(getApiError(e, t('myDonations.loadFail')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDonation(id);
      setDonations(donations.filter(d => d.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      toast.error(getApiError(e, t('myDonations.deleteFail')));
    }
  };


  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount || donationAmount);
    if (!amount || amount <= 0) {
      toast.error(t('myDonations.invalidAmount'));
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      toast.success(t('myDonations.paymentSuccess'));
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
      case 'delivered': return { label: t('myDonations.statusDelivered'), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' };
      case 'reserved': return { label: t('myDonations.statusReserved'), icon: Clock, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' };
      default: return { label: t('myDonations.statusAvailable'), icon: Package, color: 'text-primary-600 bg-primary-50', border: 'border-primary-100' };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <Heart className="text-red-600" size={40} />
            {t('myDonations.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('myDonations.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowDonateTypeModal(true)}
          className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20"
        >
          {t('myDonations.donateBtn')}
        </button>
      </header>

      {donations.length === 0 && !loading ? (
        <div className="glass-card p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl opacity-50">🎁</div>
           <h3 className="text-xl font-black text-slate-800">{t('myDonations.empty')}</h3>
           <p className="text-slate-400 font-bold">{t('myDonations.emptyDesc')}</p>
           <button
             onClick={() => setShowDonateTypeModal(true)}
             className="btn-primary px-8 h-12"
           >
             {t('myDonations.donateBtnShort')}
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
                    <div className="flex gap-6 items-start text-start w-full md:w-auto">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          💊
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800">{don.name}</h3>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                             <MapPin size={12} className="text-primary-500" />
                             {don.location}
                          </p>
                          <p className="text-[10px] font-black text-slate-300">{t('myDonations.quantity')} {don.quantity} | {t('myDonations.expiryDate')} {don.expiry_date}</p>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                       <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border ${status.color} ${status.border}`}>
                          <status.icon size={14} />
                          {status.label}
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmDelete(don.id)}
                            className="h-10 px-6 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            {t('myDonations.delete')}
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
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myDonations.chooseTypeTitle')}</h3>
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
                  className="w-full p-6 bg-slate-50 hover:bg-primary-50/50 border border-slate-100 hover:border-primary-200 rounded-3xl flex items-center gap-4 transition-all text-start group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💊</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{t('myDonations.donateMedTitle')}</h4>
                    <p className="text-xs text-slate-400 font-bold">{t('myDonations.donateMedDesc')}</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowDonateTypeModal(false);
                    setShowMoneyModal(true);
                  }}
                  className="w-full p-6 bg-slate-50 hover:bg-red-50/50 border border-slate-100 hover:border-red-200 rounded-3xl flex items-center gap-4 transition-all text-start group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💰</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{t('myDonations.donateMoneyTitle')}</h4>
                    <p className="text-xs text-slate-400 font-bold">{t('myDonations.donateMoneyDesc')}</p>
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
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">{t('myDonations.moneyTitle')}</h3>
                <button onClick={resetPaymentForm} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              {!paymentSuccess ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-6 text-start">
                  {/* Select Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myDonations.selectAmount')}</label>
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
                          {amount} {t('myDonations.egp')}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder={t('myDonations.customAmount')}
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
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('myDonations.paymentMethod')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'card', label: t('myDonations.methodCard'), icon: CreditCard },
                        { id: 'vodafone', label: t('myDonations.methodVodafone'), icon: Wallet },
                        { id: 'fawry', label: t('myDonations.methodFawry'), icon: Wallet }
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
                          <label className="text-xs font-bold text-slate-500 ps-2">{t('myDonations.cardNumber')}</label>
                          <input
                            type="text"
                            required
                            placeholder="1234 5678 1234 5678"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                            maxLength={19}
                            className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-end"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 ps-2">{t('myDonations.cardExpiry')}</label>
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
                            <label className="text-xs font-bold text-slate-500 ps-2">{t('myDonations.cardCvv')}</label>
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
                        <label className="text-xs font-bold text-slate-500 ps-2">{t('myDonations.walletPhone')}</label>
                        <input
                          type="tel"
                          required
                          placeholder="01xxxxxxxxx"
                          value={paymentPhone}
                          onChange={e => setPaymentPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 h-12 px-6 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all text-end"
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
                        <span>{t('myDonations.processing')}</span>
                      </>
                    ) : (
                      <span>{t('myDonations.donateNow')} {customAmount || donationAmount} {t('myDonations.egp')} ❤️</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">🎉</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800">{t('myDonations.thanksTitle')}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-bold">
                      {t('myDonations.thanksDesc1')} <span className="text-emerald-600">{customAmount || donationAmount} {t('myDonations.egp')}</span> {t('myDonations.thanksDesc2')}
                    </p>
                  </div>
                  <button
                    onClick={resetPaymentForm}
                    className="btn-primary h-12 px-8 rounded-2xl mx-auto shadow-md"
                  >
                    {t('myDonations.closeWindow')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={!!confirmDelete}
        variant="delete"
        message={t('myDonations.deleteConfirm')}
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default MyDonations;
