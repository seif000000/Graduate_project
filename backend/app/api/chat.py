from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
import httpx
import os
from app.api.deps import get_current_active_user
from app.models.user import User

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

@router.post("/ask")
async def ask_ai(chat_in: ChatMessage, current_user: User = Depends(get_current_active_user)):
    # Use env var if set, fall back to hardcoded key
    api_key = os.getenv("GEMINI_API_KEY") or _FALLBACK_KEY

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{SYSTEM_INSTRUCTION}\n\nسؤال المستخدم: {chat_in.message}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024,
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            gemini_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"response": gemini_text}

    except httpx.HTTPStatusError as e:
        print(f"Gemini API Error: {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="فشل الاتصال بنظام الذكاء الاصطناعي")
    except Exception as e:
        print(f"Internal Error: {str(e)}")
        raise HTTPException(status_code=500, detail="حدث خطأ داخلي في الخادم")
