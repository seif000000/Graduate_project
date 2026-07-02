// Safe date helpers — never throw on null/invalid values, return a fallback instead.
const isValid = (d) => d instanceof Date && !Number.isNaN(d.getTime());

export function formatDate(value, { locale = 'ar-EG', fallback = '—', options } = {}) {
  if (!value) return fallback;
  const d = new Date(value);
  return isValid(d) ? d.toLocaleDateString(locale, options) : fallback;
}

export function formatDateTime(value, { locale = 'ar-EG', fallback = '—', options } = {}) {
  if (!value) return fallback;
  const d = new Date(value);
  return isValid(d) ? d.toLocaleString(locale, options) : fallback;
}

export function formatTime(value, { locale = 'ar-EG', fallback = '—', options } = {}) {
  if (!value) return fallback;
  const d = new Date(value);
  return isValid(d) ? d.toLocaleTimeString(locale, options) : fallback;
}
