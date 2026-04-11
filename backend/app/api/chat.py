from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
import httpx
import os
from app.api.deps import get_current_active_user
from app.models.user import User

load_dotenv()

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    message: str

@router.post("/ask")
async def ask_ai(chat_in: ChatMessage, current_user: User = Depends(get_current_active_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"response": "عذراً، نظام الذكاء الاصطناعي غير مفعل حالياً. يرجى مراجعة الإعدادات."}
    
    # System Instruction: Expert Medical Assistant
    system_instruction = (
        "أنت مساعد طبي ذكي خبير في منصة 'مُسند'. "
        "مهمتك هي مساعدة المستخدمين العرب في فهم الأدوية، توضيح البدائل المتاحة، وتقديم نصائح صحية مبسطة. "
        "كن ودوداً، مهنياً، ودقيقاً. "
        "في حالة الاستفسارات الخطيرة، ذكر المستخدم دائماً بضرورة استشارة الطبيب."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction}\n\nسؤال المستخدم: {chat_in.message}"}
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
            
            # Extract text from Gemini response
            gemini_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"response": gemini_text}
            
    except httpx.HTTPStatusError as e:
        print(f"Gemini API Error: {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="فشل الاتصال بنظام الذكاء الاصطناعي")
    except Exception as e:
        print(f"Internal Error: {str(e)}")
        raise HTTPException(status_code=500, detail="حدث خطأ داخلي في الخادم")
