import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  AlertTriangle, 
  Heart, 
  Search, 
  ShieldAlert, 
  HandHeart,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { getAllRequests, getApiError } from '../api';
import { formatDate } from '../utils/formatDate';
import { toast } from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';

const Community = () => {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'emergency', 'aid'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getAllRequests();
        setRequests(res.data);
      } catch (e) {
        console.error(e);
        toast.error(getApiError(e, t('community.loadFail')));
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const tabs = [
    { id: 'feed', name: t('community.tabFeed'), icon: Users },
    { id: 'emergency', name: t('community.tabEmergency'), icon: AlertTriangle },
    { id: 'aid', name: t('community.tabAid'), icon: HandHeart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 mt-10">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-start">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('community.title')}</h1>
            <p className="text-slate-600">{t('community.subtitle')}</p>
          </div>
          <button className="btn-primary flex items-center gap-2 py-4 px-8 shadow-2xl shadow-primary-200 ring-4 ring-primary-50">
            <Plus size={20} />
            {t('community.addSos')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 w-fit mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                activeTab === tab.id 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {requests.map(req => (
                    <div key={req.id} className="glass-card p-6 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg border-2 border-white shadow-sm overflow-hidden">
                            {(req.medicine_name || '؟').charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{t('community.musnadUser')}</h3>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(req.created_at)}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {req.location}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          req.urgency === 'طارئ' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-primary-50 text-primary-600'
                        }`}>
                          {req.urgency}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="font-bold text-primary-700 mb-1">{t('community.medRequested')} {req.medicine_name}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex gap-4">
                          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
                            <MessageCircle size={16} />
                            {t('community.pendingReplies')}
                          </button>
                          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors">
                            <Share2 size={16} />
                            {t('community.share')}
                          </button>
                        </div>
                        <button
                          onClick={() => toast.success(t('community.offerToast'))}
                          className="bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                        >
                          {t('community.iHaveMed')}
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'emergency' && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-900 mb-2">{t('community.emergencyTitle')}</h2>
                    <p className="text-red-700 max-w-lg mx-auto mb-6">{t('community.emergencyDesc')}</p>
                  </div>
                  {/* Reuse feed component with only 'طارئ' filtering in a real app */}
                  <div className="text-center py-20 text-slate-400">
                    <AlertTriangle size={40} className="mx-auto mb-4 opacity-20" />
                    <p>{t('community.noEmergency')}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'aid' && (
                <motion.div
                  key="aid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="glass-card p-10 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
                    <HandHeart size={120} className="absolute -bottom-4 -left-4 opacity-10 rotate-12" />
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-4">{t('community.aidTitle')}</h2>
                      <p className="text-primary-100 max-w-xl leading-relaxed mb-8">
                        {t('community.aidDesc')}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all flex items-center gap-2">
                          <Plus size={20} />
                          {t('community.requestAid')}
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                          {t('community.howVerify')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <ShieldAlert size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{t('community.credibilityTitle')}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {t('community.credibilityDesc')}
                      </p>
                    </div>
                    <div className="p-8 border border-slate-100 rounded-3xl bg-white space-y-4">
                      <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                        <Heart size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{t('community.partnerTitle')}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {t('community.partnerDesc')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-primary-100 bg-primary-50/30">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-primary-600" />
                {t('community.rulesTitle')}
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> {t('community.rule1')}</li>
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> {t('community.rule2')}</li>
                <li className="flex gap-2 items-start"><CheckCircle size={14} className="text-primary-600 shrink-0" /> {t('community.rule3')}</li>
              </ul>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-bold text-slate-900 mb-4">{t('community.mostRequested')}</h4>
              <div className="space-y-2">
                {[t('community.med1'), t('community.med2'), t('community.med3')].map(item => (
                  <div key={item} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] text-slate-400 font-bold border border-slate-100">{t('community.missing')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-lg text-center space-y-4">
              <HelpCircle size={40} className="text-slate-200 mx-auto" />
              <h4 className="font-bold text-slate-900">{t('community.haveQuestion')}</h4>
              <p className="text-xs text-slate-500">{t('community.supportDesc')}</p>
              <button className="text-primary-600 font-bold text-sm hover:underline">{t('community.helpCenter')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
