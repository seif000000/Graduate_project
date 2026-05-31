// AI Service — supports Gemini, OpenAI, and Groq (OpenAI-compatible)
// Tries direct browser call first, falls back to backend

// ── API Configuration ─────────────────────────────────────────────────────────
// Active provider: 'gemini' | 'openai' | 'groq'
const PROVIDER = 'groq';

const CONFIG = {
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    key: 'AQ.Ab8RN6KjatBDdzeWb-FvGCfdkU9R_yaOueAt6tVwzgbBfkJFpQ',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: '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',
    model: 'gpt-4o-mini',
  },
  groq: {
    // xai- prefix = xAI API (Grok) — OpenAI-compatible
    url: 'https://api.x.ai/v1/chat/completions',
    key: 'xai-q4JTuRzIQTVU0BZV6gGSTxUUXz6CQE0B7PB0GVxXOw15o6XBlt77p7dGmj0xzQweejDpoEas0YMU3LKY',
    model: 'grok-3-mini',
  },
};

const SYSTEM_PROMPT =
  "أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة 'مُسند' لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم. " +
  "مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط. " +
  "يرجى الالتزام الكامل بتقديم إرشادات لهذين المرضين فقط. " +
  "إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم على منصة مُسند. " +
  "كن ودوداً جداً، مهنياً، ودقيقاً. " +
  "تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج.";

// ─── Direct browser call ──────────────────────────────────────────────────────
async function callAIDirect(message) {
  const cfg = CONFIG[PROVIDER];

  // Gemini has its own request format
  if (PROVIDER === 'gemini') {
    const res = await fetch(`${cfg.url}?key=${cfg.key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nسؤال المستخدم: ${message}` }] }],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  // OpenAI-compatible (openai / groq)
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${PROVIDER} HTTP ${res.status}: ${err?.error?.message || ''}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Backend fallback ─────────────────────────────────────────────────────────
async function callAIViaBackend(message) {
  const token = localStorage.getItem('token');
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

// ─── Public API ───────────────────────────────────────────────────────────────
export async function askGemini(message) {
  try {
    const text = await callAIDirect(message);
    console.log(`[AI] Used: ${PROVIDER} direct`);
    return text;
  } catch (err) {
    console.warn('[AI] Direct failed, trying backend...', err.message);
    const text = await callAIViaBackend(message);
    console.log('[AI] Used: backend route');
    return text;
  }
}
