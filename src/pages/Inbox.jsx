import { motion } from 'framer-motion';
import { Search, Send, Image, Paperclip, MoreVertical, Phone, Info, Check, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getInboxChats, getInboxMessages, sendInboxMessage, getApiError } from '../api';
import { useLang } from '../context/LanguageContext';

const Inbox = () => {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');

  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatSearch, setChatSearch] = useState('');

  const visibleChats = chats.filter(
    (c) => !chatSearch.trim() || c.name?.toLowerCase().includes(chatSearch.trim().toLowerCase())
  );

  // Load chats on component mount
  useEffect(() => {
    getInboxChats().then(res => {
      const chatList = res.data;
      setChats(chatList);
      
      if (targetUserId) {
        const idNum = parseInt(targetUserId);
        setActiveChat(idNum);
        // If this user is not in the chat list, add them temporarily so they show up
        if (!chatList.some(c => c.id === idNum)) {
          const newChat = {
            id: idNum,
            name: targetUserName || t('inbox.defaultDonor'),
            lastMsg: t('inbox.startConversation'),
            time: t('inbox.now'),
            unread: 0,
            online: true
          };
          setChats(prev => [newChat, ...prev]);
        }
      } else if (chatList.length > 0) {
        setActiveChat(chatList[0].id);
      }
    }).catch(err => {
      toast.error(getApiError(err, t('inbox.loadFail')));
    }).finally(() => {
      setLoading(false);
    });
  }, [targetUserId, targetUserName]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      getInboxMessages(activeChat).then(res => {
        setMessages(res.data);
      }).catch(err => {
        toast.error(getApiError(err, t('inbox.loadMessagesFail')));
      });
    }
  }, [activeChat]);

  // Handle sending message
  const handleSend = async () => {
     if (!message.trim() || !activeChat) return;
     try {
       const res = await sendInboxMessage({ text: message, receiver_id: activeChat });
       setMessages(prev => [...prev, res.data]);
       setMessage('');
     } catch (err) {
       toast.error(getApiError(err, t('inbox.sendFail')));
     }
  };



  return (
    <div className="flex flex-col lg:flex-row gap-6 overflow-hidden" style={{height: 'calc(100vh - 160px)'}}>
      {/* Sidebar - Contacts */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col glass-card overflow-hidden max-h-64 lg:max-h-full">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-800">{t('inbox.title')}</h2>
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={t('inbox.searchPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 h-10 ps-10 pe-4 rounded-xl text-xs font-bold outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto divide-y divide-slate-50">
          {loading ? (
            <div className="text-center p-6 text-slate-400">{t('inbox.loading')}</div>
          ) : visibleChats.length === 0 ? (
            <div className="text-center p-6 text-slate-400 text-xs font-bold">{t('inbox.noMatch')}</div>
          ) : visibleChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-slate-50 ${activeChat === chat.id ? 'bg-primary-50/50 border-s-4 border-primary-500' : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  {chat.name.slice(0, 2)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 end-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-grow min-w-0 text-start">
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
          {activeChat ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm border border-white/10">
                {chats.find(c => c.id === activeChat)?.name?.slice(0, 2)}
              </div>
              <div className="text-start">
                <h4 className="font-black text-lg">{chats.find(c => c.id === activeChat)?.name}</h4>
                {chats.find(c => c.id === activeChat)?.online && <p className="text-[10px] text-primary-300 font-bold uppercase tracking-widest">{t('inbox.onlineNow')}</p>}
              </div>
            </div>
          ) : (
            <div>{t('inbox.loading')}</div>
          )}
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><Phone size={18} /></button>
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          <div className="text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{t('inbox.today')}</span>
          </div>
          
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-start relative group ${
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('inbox.messagePlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 h-12 ps-6 pe-12 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500 transition-all"
              />
              <button
                onClick={handleSend}
                className="absolute start-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-all"
              >
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
