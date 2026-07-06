import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getMyNotifications } from '../api';

/**
 * Bell that links to /notifications and shows a live unread badge.
 * Polls every 30s so new notifications (e.g. someone responded to your
 * donation or SOS) appear without a page reload.
 */
export default function NotificationBell({ className = '', iconSize = 17, badgeClass = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await getMyNotifications();
        if (alive) setCount((res.data || []).filter((n) => n.is_new).length);
      } catch {
        /* not logged in / offline — ignore */
      }
    };
    load();
    const id = setInterval(load, 30000);
    // Refresh when the tab regains focus.
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <Link to="/notifications" className={className}>
      <Bell size={iconSize} />
      {count > 0 && (
        <span
          className={`absolute -top-1 -start-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center ${badgeClass}`}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
