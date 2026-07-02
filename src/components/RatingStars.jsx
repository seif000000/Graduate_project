import { Star, BadgeCheck } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/**
 * Compact rating display. Shows filled/empty stars for `rating` (0-5),
 * a numeric value, and the number of reviews. Falls back to "new"
 * when there are no ratings yet.
 */
export function RatingStars({ rating, count = 0, size = 12, className = '' }) {
  const { t } = useLang();
  const value = Number(rating) || 0;
  const hasRatings = count > 0 && value > 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={hasRatings ? `${value} ${t('rating.ofFive')} (${count} ${t('rating.reviews')})` : t('rating.none')}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={s <= Math.round(value) && hasRatings ? 'text-amber-400' : 'text-slate-300'}
            fill={s <= Math.round(value) && hasRatings ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      {hasRatings ? (
        <span className="text-[10px] font-black text-slate-500">{value.toFixed(1)}</span>
      ) : (
        <span className="text-[10px] font-bold text-slate-400">{t('rating.new')}</span>
      )}
      {hasRatings && count > 0 && (
        <span className="text-[9px] font-bold text-slate-300">({count})</span>
      )}
    </div>
  );
}

/** Small "verified" badge for trusted pharmacies / donors. */
export function VerifiedBadge({ size = 14, label, className = '' }) {
  const { t } = useLang();
  const text = label ?? t('card.verified');
  return (
    <span className={`inline-flex items-center gap-1 text-primary-600 ${className}`} title={t('rating.verifiedAccount')}>
      <BadgeCheck size={size} className="text-primary-600" fill="currentColor" stroke="white" />
      {text && <span className="text-[9px] font-black uppercase tracking-wider">{text}</span>}
    </span>
  );
}

export default RatingStars;
