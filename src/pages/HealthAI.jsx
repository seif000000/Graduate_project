import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, ShieldCheck, Info, Sparkles, Mic, Paperclip, MessageSquare, Trash2 } from 'lucide-react';
import { askGemini } from '../services/gemini';

const QUICK_QUESTIONS = [
  'ما هي أعراض ارتفاع السكر في الدم؟',
  'كيف أتحكم في ضغط الدم طبيعياً؟',
  'ما الفرق بين السكري النوع الأول والثاني؟',
  'هل يمكنني تناول العسل مع السكري؟',
];

const HealthAI = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'أهلاً بك! 👋 أنا مساعدك الطبي الذكي في منصة مُسند، متخصص في السكري وضغط الدم المرتفع.\n\nيمكنني مساعدتك في:\n• الاستفسارات عن الأدوية والجرعات\n• النصائح الغذائية لمرضى السكري والضغط\n• فهم نتائج التحاليل\n• الأدوية البديلة المتاحة\n\nكيف يمكنني مساعدتك اليوم؟',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await askGemini(text.trim());
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: 'عذراً، واجهت مشكلة مؤقتة في الاتصال. يرجى المحاولة مرة أخرى. 🔄',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'ai',
      text: 'تم مسح المحادثة. كيف يمكنني مساعدتك من جديد؟ 😊',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8" dir="rtl">
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col gap-6">
        <div className="flex-grow glass-card overflow-hidden flex flex-col p-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                <Bot size={24} />
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black text-slate-800 leading-none">مساعد مسند الذكي</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    نشط الآن • متخصص السكري وضغط الدم
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="p-2.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                title="مسح المحادثة"
              >
                <Trash2 size={18} />
              </button>
              <button className="p-2.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                <Info size={18} />
              </button>
              <button className="p-2.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                <ShieldCheck size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scrollbox */}
          <div
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold shadow-sm
                  ${msg.role === 'ai'
                    ? 'bg-gradient-to-br from-primary-400 to-primary-700 text-white'
                    : 'bg-slate-800 text-white'
                  }`}
                >
                  {msg.role === 'ai' ? <Sparkles size={16} /> : '👤'}
                </div>

                {/* Bubble */}
                <div className={`space-y-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap
                    ${msg.role === 'ai'
                      ? 'bg-white border border-slate-100 text-slate-700 rounded-tr-none'
                      : 'bg-primary-600 text-white rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase px-1">{msg.time}</p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-3xl rounded-tr-none shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="اسأل عن السكري وضغط الدم..."
                className="w-full bg-slate-50 border border-slate-200 h-14 pr-5 pl-16 rounded-2xl outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-slate-700 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Send size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0 hidden xl:flex flex-col gap-6">
        {/* Quick Questions */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={15} className="text-primary-500" /> أسئلة شائعة
          </h3>
          <div className="space-y-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="w-full text-right p-3.5 rounded-2xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 cursor-pointer transition-all group text-xs font-bold text-slate-600 hover:text-primary-700 disabled:opacity-40"
              >
                <span className="text-primary-400 ml-2">💬</span>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-8 bg-primary-950 text-white border-none overflow-hidden relative">
          <div className="relative z-10 space-y-4 text-right">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
            <h4 className="text-lg font-black leading-tight">مساعد متخصص</h4>
            <p className="text-xs text-white/60 font-medium leading-relaxed">
              هذا المساعد متخصص حصرياً في السكري وضغط الدم. النصائح المقدمة إرشادية ولا تغني عن استشارة طبيبك.
            </p>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-white/80 font-bold">مدعوم بتقنية Google Gemini</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 text-9xl opacity-10 -rotate-12">🤖</div>
        </div>
      </div>
    </div>
  );
};

export default HealthAI;
