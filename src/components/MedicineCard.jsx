import { motion } from 'framer-motion';
import { MapPin, Clock, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { RatingStars, VerifiedBadge } from './RatingStars';
import { useLang } from '../context/LanguageContext';

const MedicineCard = ({ med, onDetail }) => {
  const { t } = useLang();
  const isFree = med.price === 'مجاني' || med.price === 0;
  const isExpiringSoon = med.expiryStatus === 'قريب';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => onDetail && onDetail(med)}
      className="glass-card overflow-hidden group transition-all hover:shadow-2xl border-slate-100 cursor-pointer"
    >
      {/* Visual Header */}
      <div className={`h-32 relative flex items-center justify-center text-4xl bg-gradient-to-br ${med.bg || 'from-emerald-50 to-emerald-100'}`}>
        {med.icon || '💊'}
        
        {/* Expiry Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-slate-600 flex items-center gap-1 shadow-sm uppercase tracking-wider">
          <Clock size={10} className={isExpiringSoon ? 'text-red-500 animate-pulse' : 'text-primary-600'} />
          {t('card.expiry')}: {med.expiryDate || med.expiry_date}
        </div>
        
        {/* Verified donor / pharmacy badge */}
        {med.donor_verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-white/40">
             <VerifiedBadge size={12} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 text-right">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-primary-600 transition-colors uppercase truncate">
            {med.name}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {med.genericName || med.generic_name || t('card.genericUnknown')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 uppercase tracking-tighter">
             <Package size={10} /> {med.quantity}
           </span>
           <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${isFree ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
             {isFree ? t('card.free') : `💰 ${med.price} ${t('common.currency')}`}
           </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
           <MapPin size={12} className="text-primary-500" />
           <span>{med.location}</span>
           {med.distance && (
             <>
               <span className="w-1 h-1 rounded-full bg-slate-200"></span>
               <span className="text-primary-600">{med.distance} {t('card.km')}</span>
             </>
           )}
        </div>
           
        {med.is_near_expiry && (
          <div className="mt-3 py-1 px-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-2">
             <AlertCircle size={10} className="text-amber-600" />
             <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">{t('card.nearExpiryWarn')}</span>
          </div>
        )}
        
        {med.batch_info && (
          <div className="mt-2 text-[9px] font-bold text-slate-400">
             {t('card.batch')}: {med.batch_info}
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
        <RatingStars rating={med.donor_rating} count={med.donor_rating_count} />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDetail && onDetail(med);
          }}
          className="flex items-center gap-2 text-xs font-black text-primary-600 hover:gap-3 transition-all"
        >
          {t('card.details')}
          <ChevronRight size={14} className="rotate-180" />
        </button>
      </div>
    </motion.div>
  );
};

export default MedicineCard;
