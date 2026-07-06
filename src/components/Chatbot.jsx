import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askGemini } from '../services/gemini';
import { useLang } from '../context/LanguageContext';

const Chatbot = () => {
  const { t, dir } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: 'bot', content: t('chatbot.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const text = await askGemini(input);
      setMessages(prev => [...prev, { role: 'bot', content: text }]);
    } catch (error) {
      toast.error(getApiError(error, t('chatbot.fetchError')));
      setMessages(prev => [...prev, { role: 'ai', content: t('chatbot.error') }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]" dir={dir}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white w-[380px] h-[550px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-primary-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{t('chatbot.botName')}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] text-primary-100">{t('chatbot.botSubtitle')}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                <Minimize2 size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm px-2 text-slate-700 outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping}
                  className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Send size={18} className="rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-200 flex items-center justify-center hover:bg-primary-700 transition-all relative"
          >
            <MessageSquare size={30} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
