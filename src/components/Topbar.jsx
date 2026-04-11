import { Bell, Search, Settings, MapPin, Menu } from 'lucide-react';

const Topbar = ({ title }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 sticky top-0 z-40 transition-all">
      <div className="flex-grow">
        <h2 className="text-xl font-display font-black text-slate-800 tracking-tight">{title}</h2>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
          <span>مسند</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-primary-600">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Toggle (Desktop only for now) */}
        <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all">
          <Search size={18} />
        </button>

        {/* Location Check */}
        <button className="px-4 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center gap-2 text-primary-700 font-bold text-xs hover:bg-primary-100 transition-all">
          <MapPin size={14} />
          <span>القاهرة، مصر</span>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
