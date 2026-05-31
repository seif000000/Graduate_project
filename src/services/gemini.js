// Dual-mode Gemini: tries direct browser call first, falls back to backend
const GEMINI_API_KEY = 'AIzaSyBinPjU4F800R_azFDf2nZBa5e6lComOV4';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  "أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة 'مُسند' لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم. " +
  "مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط. " +
  "يرجى الالتزام الكامل بتقديم إرشادات لهذين المرضين فقط. " +
  "إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم على منصة مُسند. " +
  "كن ودوداً جداً، مهنياً، ودقيقاً. " +
  "تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج.";

// ─── Direct browser call to Gemini ───────────────────────────────────────────
async function callGeminiDirect(message) {
  const payload = {
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nسؤال المستخدم: ${message}` }] }],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
  };
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ─── Backend fallback ─────────────────────────────────────────────────────────
async function callGeminiViaBackend(message) {
  const token = localStorage.getItem('token');
  // Detect correct backend URL
  const backendBase = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '/_backend/api/v1' : 'http://localhost:8000/api/v1');

  const res = await fetch(`${backendBase}/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
  const data = await res.json();
  return data.response;
}

// ─── Public API: try direct first, fall back to backend ──────────────────────
export async function askGemini(message) {
  try {
    const text = await callGeminiDirect(message);
    console.log('[Gemini] Used: direct browser call');
    return text;
  } catch (err) {
    console.warn('[Gemini] Direct call failed, trying backend...', err.message);
    const text = await callGeminiViaBackend(message);
    console.log('[Gemini] Used: backend route');
    return text;
  }
}
