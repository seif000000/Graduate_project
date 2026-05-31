// AI Service — all requests go through the backend (keeps API keys secure)
import { askAI } from '../api';

export async function askGemini(message) {
  const { data } = await askAI(message);
  return data.response;
}
