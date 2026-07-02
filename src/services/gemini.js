// AI Service — tries backend first, falls back to direct Gemini API if backend fails
import { askAI, identifyMedicine } from '../api';

// Read the key from the environment (Vite exposes VITE_* vars to the browser).
// Set VITE_GEMINI_KEY in a root .env file — never hardcode the key (it leaks in the bundle).
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const VISION_FIELDS = ['name', 'generic_name', 'strength', 'form', 'manufacturer', 'expiry_date', 'description'];

const VISION_INSTRUCTION =
  "أنت خبير في التعرف على الأدوية والمنتجات الدوائية من صور العلب والعبوات. " +
  "افحص صورة علبة الدواء بدقة واستخرج الحقول التالية بصيغة JSON: " +
  "name (الاسم التجاري)، generic_name (الاسم العلمي/المادة الفعالة)، strength (التركيز مثل 500mg)، " +
  "form (الشكل الدوائي)، manufacturer (الشركة المصنعة)، expiry_date (تاريخ الانتهاء YYYY-MM)، " +
  "description (وصف موجز في سطر واحد). " +
  "اجعل قيمة أي حقل غير موجود null. إذا لم تكن الصورة لعلبة دواء فاجعل كل الحقول null. " +
  "أعد JSON فقط دون أي نص إضافي.";

const SYSTEM_INSTRUCTION =
  "أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة 'مُسند' لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم. " +
  "مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط. " +
  "إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم. " +
  "كن ودوداً جداً، مهنياً، ودقيقاً. " +
  "تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج.";

async function askGeminDirect(message) {
  if (!GEMINI_KEY) throw new Error('VITE_GEMINI_KEY is not set');
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

// Convert a File/Blob to a raw base64 string (no data-URL prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function identifyMedicineDirect(base64, mimeType) {
  if (!GEMINI_KEY) throw new Error('VITE_GEMINI_KEY is not set');
  const payload = {
    contents: [
      {
        parts: [
          { text: VISION_INSTRUCTION },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      responseMimeType: 'application/json',
    },
  };
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Gemini vision failed: ${res.status}`);
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
  // Tolerate ```json fences / surrounding prose
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) text = text.slice(start, end + 1);
  const parsed = JSON.parse(text);
  const clean = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s || ['UNKNOWN', 'NULL', 'N/A', 'NONE'].includes(s.toUpperCase())) return null;
    return s;
  };
  return Object.fromEntries(VISION_FIELDS.map((f) => [f, clean(parsed[f])]));
}

/**
 * Identify a medicine from a photo of its box.
 * Tries the backend Vision endpoint first, then falls back to a direct
 * Gemini Vision call from the browser.
 * @param {File|Blob} file - the captured/uploaded image
 * @returns {Promise<{name: string|null, generic_name: string|null, expiry_date: string|null}>}
 */
export async function identifyMedicineFromImage(file) {
  const mimeType = file.type || 'image/jpeg';
  const base64 = await fileToBase64(file);

  // Try backend first
  try {
    const { data } = await identifyMedicine({ image: base64, mime_type: mimeType });
    if (data) return data;
  } catch {
    // Backend unavailable — fall through to direct call
  }

  // Fallback: call Gemini Vision directly from the browser
  try {
    return await identifyMedicineDirect(base64, mimeType);
  } catch {
    throw new Error('فشل تحليل صورة الدواء');
  }
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
