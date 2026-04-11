import { motion } from 'framer-motion';
import { Search, Send, Image, Paperclip, MoreVertical, Phone, Info, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';

const Inbox = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');

  const chats = [
    { id: 1, name: 'أحمد المتبرع', lastMsg: 'تمام، هسيبلك الدواء في الصيدلية بكرة...', time: '10:30 ص', unread: 2, online: true },
    { id: 2, name: 'صيدلية الأمل', lastMsg: 'وصلت لنا كمية جديدة من الأنسولين.', time: 'أمس', unread: 0, online: false },
    { id: 3, name: 'سارة محمد', lastMsg: 'شكراً جداً ليك، الدواء ساعد بابا كتير.', time: 'أمس', unread: 0, online: true },
    { id: 4, name: 'د. خالد بكر', lastMsg: 'هل محتاج مساعدة في قراءة التحاليل؟', time: 'الاثنين', unread: 0, online: false },
  ];

  const messages = [
    { id: 1, text: 'أهلاً بك يا أحمد، كنت بسأل عن دواء Glucophage', sender: 'me', time: '09:00 ص', status: 'read' },
    { id: 2, text: 'أهلاً يا صديقي، الدواء متاح عندي فعلاً وممكن تستلمه في أي وقت.', sender: 'them', time: '09:05 ص' },
    { id: 3, text: 'تمام، هسيبلك الدواء في صيدلية الأمل اللي في مدينة نصر بكرة الصبح باسمك.', sender: 'them', time: '09:10 ص' },
    { id: 4, text: 'تسلم جداً، جزاك الله كل خير 🙏', sender: 'me', time: '09:12 ص', status: 'read' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 overflow-hidden" style={{height: 'calc(100vh - 160px)'}} dir="rtl">
      {/* Sidebar - Contacts */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col glass-card overflow-hidden max-h-64 lg:max-h-full">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-800">صندوق الرسائل</h2>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ابحث في المحادثات..." 
              className="w-full bg-slate-50 border border-slate-200 h-10 pr-10 pl-4 rounded-xl text-xs font-bold outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto divide-y divide-slate-50">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-slate-50 ${activeChat === chat.id ? 'bg-primary-50/50 border-r-4 border-primary-500' : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  {chat.name.slice(0, 2)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-grow min-w-0 text-right">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{chat.name}</h4>
                  <span className="text-[9px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 truncate">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[8px] font-black flex items-center justify-center shadow-lg shadow-primary-500/30">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col glass-card overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary-950 text-white rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm border border-white/10">
              {chats.find(c => c.id === activeChat)?.name.slice(0, 2)}
            </div>
            <div className="text-right">
              <h4 className="font-black text-lg">{chats.find(c => c.id === activeChat)?.name}</h4>
              <p className="text-[10px] text-primary-300 font-bold uppercase tracking-widest">متصل الآن 🟢</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><Phone size={18} /></button>
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          <div className="text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">باقي اليوم</span>
          </div>
          
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-right relative group ${
                msg.sender === 'me' 
                ? 'bg-primary-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[9px] font-bold ${msg.sender === 'me' ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</span>
                  {msg.sender === 'me' && (
                    msg.status === 'read' ? <CheckCheck size={12} className="text-white/60" /> : <Check size={12} className="text-white/60" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-4">
            <button className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 transition-all flex items-center justify-center shrink-0">
              <Paperclip size={20} />
            </button>
            <button className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 transition-all flex items-center justify-center shrink-0">
              <Image size={20} />
            </button>
            <div className="flex-grow relative">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..." 
                className="w-full bg-slate-50 border border-slate-200 h-12 pr-6 pl-12 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500 transition-all"
              />
              <button className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-all">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
