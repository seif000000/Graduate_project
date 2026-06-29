// AI Service — tries backend first, falls back to direct Gemini API if backend fails
import { askAI, getApiError } from '../api';

const GEMINI_KEY = 'AIzaSyBinPjU4F800R_azFDf2nZBa5e6lComOV4';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_INSTRUCTION =
  "أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة 'مُسند' لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم. " +
  "مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط. " +
  "إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم. " +
  "كن ودوداً جداً، مهنياً، ودقيقاً. " +
  "تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج.";

async function askGeminDirect(message) {
  const payload = {
    contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nسؤال المستخدم: ${message}` }] }],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
  };
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Gemini direct failed: ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

export async function askGemini(message) {
  // Try backend first
  try {
    const { data } = await askAI(message);
    if (data?.response) return data.response;
  } catch {
    // Backend unavailable — fall through to direct call
  }

  // Fallback: call Gemini directly from browser
  try {
    return await askGeminDirect(message);
  } catch (error) {
    throw new Error('فشل الاتصال بنظام الذكاء الاصطناعي');
  }
}
