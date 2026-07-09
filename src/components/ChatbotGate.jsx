import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

/** Show floating chatbot only for logged-in users — pharmacies are excluded */
const ChatbotGate = () => {
  const { isAuthenticated, isLoading, isPharmacy } = useAuth();
  if (isLoading || !isAuthenticated || isPharmacy) return null;
  return <Chatbot />;
};

export default ChatbotGate;
