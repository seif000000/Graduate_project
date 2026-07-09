import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Mail, Pill, Percent, Calendar, Send, CheckCircle2 } from 'lucide-react';
import { createVoucher, getApiError } from '../api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const COUPON_TYPES = ['مجاني', 'خصم 25%', 'خصم 50%', 'خصم 75%'];

const PharmacyCoupons = () => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState([]); // coupons created this session
  const [form, setForm] = useState({
    recipient_email: '',
    med: '',
    type: 'خصم 50%',
    expiry: '',
  });

  const reset = () => setForm({ recipient_email: '', med: '', type: 'خصم 50%', expiry: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await createVoucher(form);
      setIssued((prev) => [res.data, ...prev]);
      toast.success(t('coupons.issueSuccess'));
      reset();
    } catch (err) {
      toast.error(getApiError(err, t('coupons.issueFail')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2 text-start">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-200">
            <Ticket size={24} />
          </span>
          {t('coupons.title')}
        </h1>
        <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-2xl">{t('coupons.subtitle')}</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issue form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6 text-start"
        >
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('coupons.recipientEmail')}</label>
            <div className="relative group">
              <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input
                type="email"
                required
                value={form.recipient_email}
                onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
                placeholder={t('coupons.recipientPlaceholder')}
                className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('coupons.medLabel')}</label>
            <div className="relative group">
              <Pill className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={form.med}
                onChange={(e) => setForm({ ...form, med: e.target.value })}
                placeholder={t('coupons.medPlaceholder')}
                className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('coupons.typeLabel')}</label>
              <div className="relative group">
                <Percent className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                >
                  {COUPON_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ps-2">{t('coupons.expiryLabel')}</label>
              <div className="relative group">
                <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
                <input
                  type="date"
                  required
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 ps-12 pe-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? t('coupons.issuing') : (<><Send size={18} /> {t('coupons.issue')}</>)}
          </button>
        </motion.form>

        {/* Issued this session */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest ps-1">{t('coupons.recentIssued')}</h2>
          {issued.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-400 font-bold text-sm">
              {t('coupons.emptyIssued')}
            </div>
          ) : (
            issued.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-5 flex items-center gap-4 text-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-black text-slate-800 truncate">{v.med}</p>
                  <p className="text-xs font-bold text-slate-400">{v.type} · {t('coupons.expires')} {v.expiry}</p>
                </div>
                <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg shrink-0">{v.id}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyCoupons;
