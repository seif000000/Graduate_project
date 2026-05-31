// Direct Gemini API service — no backend needed
const GEMINI_API_KEY = 'AIzaSyBinPjU4F800R_azFDf2nZBa5e6lComOV4';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة "مُسند" لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم.
مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط.
يرجى الالتزام الكامل بتقديم إرشادات لهذين المرضين فقط.
إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم على منصة مُسند.
كن ودوداً جداً، مهنياً، ودقيقاً.
تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج.`;

export async function askGemini(userMessage) {
  const payload = {
    contents: [
      {
        parts: [
          { text: `${SYSTEM_PROMPT}\n\nسؤال المستخدم: ${userMessage}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
