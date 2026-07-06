import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Trash2, AlertTriangle, Building, Search, X, Mail, Phone, MapPin, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUnverifiedPharmacies, verifyPharmacy, getAdminStats } from '../api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Admin = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [unverifiedPharmacies, setUnverifiedPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pharmaciesRes, statsRes] = await Promise.all([
        getUnverifiedPharmacies(),
        getAdminStats()
      ]);
      setUnverifiedPharmacies(pharmaciesRes.data);
      setStats(statsRes.data);
    } catch (e) {
      toast.error(getApiError(e, t('admin.fetchError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await verifyPharmacy(userId);
      setUnverifiedPharmacies(prev => prev.filter(p => p.id !== userId));
      toast.success(t('admin.verifySuccess'));
    } catch (e) {
      toast.error(getApiError(e, t('admin.verifyError')));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-white flex items-center gap-4">
            <ShieldCheck className="text-red-500" size={40} />
            {t('admin.dashboardTitle')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('admin.dashboardSubtitle')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between mb-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Building className="text-red-400" />
              {t('admin.verificationRequests')}
            </h2>
            <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">{unverifiedPharmacies.length} {t('admin.pending')}</span>
          </div>

          <div className="space-y-4">
             {loading ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center text-slate-400 font-bold">
                   {t('admin.loadingRequests')}
                </div>
             ) : unverifiedPharmacies.length === 0 ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center text-slate-400 font-bold">
                   {t('admin.noPendingRequests')}
                </div>
             ) : (
                unverifiedPharmacies.map((pharmacy) => (
                  <motion.div 
                    key={pharmacy.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 hover:border-red-500/30 transition-all shadow-lg"
                  >
                    <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                           {pharmacy.pharmacy_image_url ? (
                              <img src={pharmacy.pharmacy_image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                           ) : (
                              "🏥"
                           )}
                        </div>
                        <div className="text-start">
                           <h3 className="font-black text-white">{pharmacy.full_name}</h3>
                           <p className="text-xs font-bold text-slate-400">{pharmacy.email}</p>
                           <p className="text-[10px] text-red-400 font-bold mt-1">{t('admin.registrationDate')}: {pharmacy.created_at ? new Date(pharmacy.created_at).toLocaleDateString('ar-EG') : t('admin.notSpecified')}</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-3">
                        <button 
                          onClick={() => setSelectedPharmacy(pharmacy)}
                          className="h-12 px-6 rounded-xl bg-slate-800 border border-white/5 text-slate-300 font-bold text-sm hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
                        >
                           <Search size={16} />
                           {t('admin.viewFiles')}
                        </button>
                        <button 
                          onClick={() => handleVerify(pharmacy.id)}
                          className="h-12 px-6 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2"
                        >
                           <UserCheck size={16} />
                           {t('admin.verifyNow')}
                        </button>
                     </div>
                  </motion.div>
                ))
             )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 end-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-500),transparent)]"></div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                 <AlertTriangle className="text-amber-400" />
                 {t('admin.quickActions')}
              </h3>
               <div className="space-y-3 relative z-10">
                  <button 
                    onClick={() => navigate('/emergency')}
                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm flex items-center justify-between px-6 group"
                  >
                     <span>{t('admin.blockContent')}</span>
                     <Trash2 size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm flex items-center justify-between px-6 group"
                  >
                     <span>{t('admin.reviewReports')}</span>
                     <ShieldCheck size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
           </div>

           <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <h3 className="text-base font-black text-white mb-4 tracking-tight flex items-center gap-2">
                 <ShieldCheck className="text-red-500" size={18} />
                 {t('admin.platformStats')}
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">{t('admin.totalUsers')}</span>
                    <span className="text-sm font-black text-white">{stats?.total_users || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">{t('admin.registeredPharmacies')}</span>
                    <span className="text-sm font-black text-white">{stats?.total_pharmacies || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-slate-400">{t('admin.completedDonations')}</span>
                    <span className="text-sm font-black text-white">{stats?.total_delivered || 0}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{t('admin.successRate')}</span>
                    <span className="text-sm font-black text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">{stats?.success_rate || 0}%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedPharmacy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-start"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">{t('admin.pharmacyProfileTitle')}</h3>
                <p className="text-xs text-slate-400">{t('admin.pharmacyProfileSubtitle')}</p>
              </div>
              <button 
                onClick={() => setSelectedPharmacy(null)} 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-all"
              >
                 <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Pharmacy Image */}
                <div className="w-full md:w-48 h-48 rounded-2xl bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center relative group shrink-0">
                  {selectedPharmacy.pharmacy_image_url ? (
                    <img 
                      src={selectedPharmacy.pharmacy_image_url} 
                      alt={selectedPharmacy.full_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=300"; }}
                    />
                  ) : (
                    <span className="text-4xl">🏥</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                  <span className="absolute bottom-3 end-3 text-[10px] font-bold text-white bg-slate-900/60 px-2 py-0.5 rounded-md">{t('admin.facilityImage')}</span>
                </div>
                
                {/* Pharmacy Details */}
                <div className="flex-grow space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('admin.pharmacyName')}</span>
                    <p className="text-xl font-black text-white">{selectedPharmacy.full_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1"><Mail size={12} /> {t('admin.email')}</span>
                      <p className="text-xs font-bold text-slate-200 truncate">{selectedPharmacy.email}</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1"><Phone size={12} /> {t('admin.phone')}</span>
                      <p className="text-xs font-bold text-slate-200">{selectedPharmacy.phone || t('admin.notAvailable')}</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1"><Award size={12} /> {t('admin.medicalLicense')}</span>
                      <p className="text-xs font-bold text-slate-200 font-mono">{selectedPharmacy.pharmacy_license || t('admin.notAvailable')}</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1"><MapPin size={12} /> {t('admin.geoAddress')}</span>
                      <p className="text-xs font-bold text-slate-200">{selectedPharmacy.pharmacy_address || t('admin.notAvailable')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPharmacy(null)} 
                className="h-12 px-6 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all"
              >
                {t('common.close')}
              </button>
              <button 
                onClick={() => { handleVerify(selectedPharmacy.id); setSelectedPharmacy(null); }} 
                className="h-12 px-6 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2"
              >
                <UserCheck size={16} />
                {t('admin.verifyApprovePharmacy')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
