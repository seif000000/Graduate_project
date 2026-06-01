import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

/** Show floating chatbot only for logged-in users */
const ChatbotGate = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || !isAuthenticated) return null;
  return <Chatbot />;
};

export default ChatbotGate;
