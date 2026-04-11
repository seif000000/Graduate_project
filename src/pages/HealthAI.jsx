import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, ShieldCheck, Info, Sparkles, Mic, Paperclip, MessageSquare } from 'lucide-react';
import { askAI } from '../api';

const HealthAI = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'أهلاً بك! أنا مساعدك الصحي الذكي في منصة مسند. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن بدائل الأدوية، مواعيد الجرعات، أو موانع الاستعمال.', time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { 
      id: messages.length + 1, 
      role: 'user', 
      text: input, 
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAI(input);
      const aiMsg = {
        id: messages.length + 2,
        role: 'ai',
        text: response.data.response,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = {
        id: messages.length + 2,
        role: 'ai',
        text: 'عذراً، واجهت مشكلة في الاتصال بنظام الذكاء الاصطناعي. يرجى التأكد من إعداد مفتاح API في ملف .env بالخلفية.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8" dir="rtl">
      {/* Messages Area */}
      <div className="flex-grow flex flex-col gap-6">
         <div className="flex-grow glass-card overflow-hidden flex flex-col p-8 pt-10">
            {/* Chat History Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-8 mt-[-10px]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg">
                     <Bot size={24} />
                  </div>
                  <div className="text-right">
                     <h2 className="text-lg font-black text-slate-800 leading-none">مساعد مسند الذكي</h2>
                     <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نشط الآن • ذكاء اصطناعي طبي</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="p-3 text-slate-300 hover:text-slate-500 transition-all"><Info size={20} /></button>
                  <button className="p-3 text-slate-300 hover:text-slate-500 transition-all"><ShieldCheck size={20} /></button>
               </div>
            </div>

            {/* Messages Scrollbox */}
            <div className="flex-grow overflow-y-auto space-y-8 pr-4 scrollbar-hide">
               {messages.map((msg) => (
                 <motion.div
                   key={msg.id}
                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                 >
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg ${msg.role === 'ai' ? 'bg-primary-50 text-primary-600' : 'bg-slate-900 text-white'}`}>
                       {msg.role === 'ai' ? <Sparkles size={18} /> : '👤'}
                    </div>
                    <div className="space-y-1 max-w-[80%]">
                       <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'ai' ? 'bg-white border border-slate-100 text-slate-700' : 'bg-primary-950 text-white'}`}>
                          {msg.text}
                       </div>
                       <p className={`text-[10px] font-bold text-slate-300 uppercase ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>{msg.time}</p>
                    </div>
                 </motion.div>
               ))}
            </div>

            {/* Input Area */}
            <div className="pt-8 mt-4 border-t border-slate-50">
               <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                     <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"><Paperclip size={20} /></button>
                     <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-not-allowed opacity-50"><Mic size={20} /></button>
                  </div>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="اسأل أي سؤال طبي عن الأدوية..." 
                    className="w-full bg-slate-50 border border-slate-200 h-16 pr-28 pl-16 rounded-3xl outline-none focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 transition-all font-bold text-slate-700"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-950 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                     <Send size={20} className="rotate-180" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* History Sidebar */}
      <div className="w-80 shrink-0 hidden xl:flex flex-col gap-6">
         <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <MessageSquare size={16} className="text-primary-500" /> جلسات سابقة
            </h3>
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-all group">
                    <p className="text-xs font-bold text-slate-700 leading-tight mb-2 truncate">استفسار عن جرعة بنادول أكسترا</p>
                    <div className="flex justify-between items-center opacity-60">
                       <span className="text-[10px] font-black uppercase">منذ يومين</span>
                       <span className="text-[10px] bg-primary-100 text-primary-700 px-2 rounded-md">14 رسالة</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">إظهار كل السجل</button>
         </div>

         <div className="glass-card p-8 bg-primary-950 text-white border-none overflow-hidden relative">
            <div className="relative z-10 space-y-4 text-right">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
               <h4 className="text-lg font-black leading-tight">تدريب مُخصص</h4>
               <p className="text-xs text-white/60 font-medium leading-relaxed">المساعد يتعلّم مما تشاركه معه لتوفير نصائح طبية أدق ومناسبة لحالتك الصحية.</p>
               <button className="btn-primary w-full h-10 text-[10px] bg-white text-primary-950 hover:bg-primary-50">تفعيل الملف الصحي</button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12">🤖</div>
         </div>
      </div>
    </div>
  );
};

export default HealthAI;
