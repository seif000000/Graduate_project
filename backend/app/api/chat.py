from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
import httpx
import os

load_dotenv()

router = APIRouter(prefix="/chat", tags=["chat"])

# Hardcoded fallback key — works on Vercel without needing env var config
_FALLBACK_KEY = "AIzaSyBinPjU4F800R_azFDf2nZBa5e6lComOV4"

SYSTEM_INSTRUCTION = (
    "أنت مساعد طبي ذكي خبير ومتخصص حصرياً في منصة 'مُسند' لمساعدة وإرشاد مرضى السكري وارتفاع ضغط الدم. "
    "مهمتك هي الإجابة عن الاستفسارات الطبية، توضيح الجرعات ومواعيدها، وتقديم نصائح صحية غذائية وحياتية وبدائل أدوية مخصصة لمرضى السكري والضغط فقط. "
    "يرجى الالتزام الكامل بتقديم إرشادات لهذين المرضين فقط. "
    "إذا كانت رسالة المستخدم تتعلق بمرض آخر أو موضوع خارج نطاق السكري أو ضغط الدم، فأجبه بلطف بأنك متخصص فقط في مساعدة مرضى السكري وضغط الدم على منصة مُسند لمساعدتهم بفعالية. "
    "كن ودوداً جداً، مهنياً، ودقيقاً. "
    "تذكر دائماً في نهاية إجابتك أن هذه النصائح إرشادية فقط ولا تغني عن استشارة الطبيب المعالج."
)


class ChatMessage(BaseModel):
    message: str


async def _call_gemini(client: httpx.AsyncClient, message: str, api_key: str) -> str:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{SYSTEM_INSTRUCTION}\n\nسؤال المستخدم: {message}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024,
        },
    }
    response = await client.post(
        url,
        params={"key": api_key},
        json=payload,
        timeout=30.0,
    )
    response.raise_for_status()
    data = response.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


async def _call_openai_compatible(
    client: httpx.AsyncClient,
    message: str,
    *,
    url: str,
    api_key: str,
    model: str,
) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": message},
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    response = await client.post(url, json=payload, headers=headers, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


@router.post("/ask")
async def ask_ai(chat_in: ChatMessage):
    providers = []

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        providers.append(("gemini", gemini_key))

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        providers.append(("openai", openai_key))

    xai_key = os.getenv("XAI_API_KEY")
    if xai_key:
        providers.append(("xai", xai_key))

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        providers.append(("groq", groq_key))

    if not providers:
        # Fallback to the hardcoded key if no env vars are set
        providers.append(("gemini", _FALLBACK_KEY))

    errors = []

    async with httpx.AsyncClient() as client:
        for name, key in providers:
            try:
                if name == "gemini":
                    ai_text = await _call_gemini(client, chat_in.message, key)
                elif name == "openai":
                    ai_text = await _call_openai_compatible(
                        client,
                        chat_in.message,
                        url="https://api.openai.com/v1/chat/completions",
                        api_key=key,
                        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    )
                elif name == "groq":
                    ai_text = await _call_openai_compatible(
                        client,
                        chat_in.message,
                        url="https://api.groq.com/openai/v1/chat/completions",
                        api_key=key,
                        model=os.getenv("GROQ_MODEL", "llama3-8b-8192"),
                    )
                else:
                    ai_text = await _call_openai_compatible(
                        client,
                        chat_in.message,
                        url="https://api.x.ai/v1/chat/completions",
                        api_key=key,
                        model=os.getenv("XAI_MODEL", "grok-3-mini"),
                    )

                print(f"[AI] Used provider: {name}")
                return {"response": ai_text}

            except httpx.HTTPStatusError as e:
                detail = e.response.text[:200]
                print(f"[AI] {name} failed: {e.response.status_code} {detail}")
                errors.append(f"{name}: HTTP {e.response.status_code}")
            except Exception as e:
                print(f"[AI] {name} error: {e}")
                errors.append(f"{name}: {str(e)}")

    raise HTTPException(
        status_code=502,
        detail=f"فشل الاتصال بنظام الذكاء الاصطناعي ({'; '.join(errors)})",
    )
