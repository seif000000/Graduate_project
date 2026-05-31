// AI Service — all requests go through the backend (keeps API keys secure)
import { askAI, getApiError } from '../api';

export async function askGemini(message) {
  try {
    const { data } = await askAI(message);
    return data.response;
  } catch (error) {
    throw new Error(getApiError(error, 'فشل الاتصال بنظام الذكاء الاصطناعي'));
  }
}
