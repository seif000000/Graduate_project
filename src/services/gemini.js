// Wrapper around the backend /chat/ask endpoint
// Backend handles Gemini call server-side — no CORS issues
import { askAI } from '../api';

export async function askGemini(message) {
  const response = await askAI(message);
  return response.data.response;
}
