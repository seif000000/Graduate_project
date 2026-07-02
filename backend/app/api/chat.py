from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
import httpx
import json
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


class MedicineImage(BaseModel):
    image: str  # base64-encoded image data (without the data:...;base64, prefix)
    mime_type: str = "image/jpeg"


VISION_INSTRUCTION = (
    "أنت خبير في التعرف على الأدوية والمنتجات الدوائية من صور العلب والعبوات. "
    "افحص صورة علبة الدواء بدقة وابحث في معرفتك عن تفاصيل المنتج، ثم استخرج الحقول التالية: "
    "name = الاسم التجاري الظاهر على العلبة. "
    "generic_name = الاسم العلمي / المادة الفعالة. "
    "strength = التركيز أو الجرعة (مثال: 500mg). "
    "form = الشكل الدوائي (أقراص، شراب، كبسولات، حقن...). "
    "manufacturer = الشركة المصنّعة إن ظهرت. "
    "expiry_date = تاريخ انتهاء الصلاحية بصيغة YYYY-MM إن وُجد. "
    "description = وصف موجز جداً للمنتج ودواعي استعماله (سطر واحد). "
    "إذا لم تجد قيمة لأي حقل فاجعلها null. "
    "إذا لم تكن الصورة لعلبة دواء أو تعذّرت القراءة، اجعل جميع الحقول null. "
    "أعد النتيجة بصيغة JSON فقط دون أي نص إضافي."
)

VISION_FIELDS = (
    "name",
    "generic_name",
    "strength",
    "form",
    "manufacturer",
    "expiry_date",
    "description",
)

# Gemini uses an OpenAPI-ish schema where nullability is `nullable: true`
VISION_SCHEMA = {
    "type": "object",
    "properties": {f: {"type": "string", "nullable": True} for f in VISION_FIELDS},
    "required": list(VISION_FIELDS),
}


def _clean_value(v):
    if v is None:
        return None
    v = str(v).strip()
    if not v or v.upper() in ("UNKNOWN", "NULL", "N/A", "NONE"):
        return None
    return v


def _parse_vision_json(text: str) -> dict:
    """Parse a model's JSON reply, tolerating ```json fences and extra prose."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        # drop a leading language tag like "json\n"
        if "\n" in text:
            text = text.split("\n", 1)[1]
    # Grab the outermost JSON object if the model wrapped it in prose
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    parsed = json.loads(text)
    return {f: _clean_value(parsed.get(f)) for f in VISION_FIELDS}


async def _vision_gemini(
    client: httpx.AsyncClient, image_b64: str, mime_type: str, api_key: str
) -> dict:
    model = os.getenv("GEMINI_VISION_MODEL", "gemini-2.5-flash")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": VISION_INSTRUCTION},
                    {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 512,
            "responseMimeType": "application/json",
            "responseSchema": VISION_SCHEMA,
        },
    }
    response = await client.post(url, params={"key": api_key}, json=payload, timeout=45.0)
    response.raise_for_status()
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return _parse_vision_json(text)


async def _vision_openai_compatible(
    client: httpx.AsyncClient,
    image_b64: str,
    mime_type: str,
    *,
    url: str,
    api_key: str,
    model: str,
) -> dict:
    """Vision call for any OpenAI-compatible API (OpenAI, Groq)."""
    data_url = f"data:{mime_type};base64,{image_b64}"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": VISION_INSTRUCTION},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "استخرج بيانات المنتج من هذه الصورة بصيغة JSON."},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
        "temperature": 0.1,
        "max_tokens": 512,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    response = await client.post(url, json=payload, headers=headers, timeout=45.0)
    response.raise_for_status()
    data = response.json()
    text = data["choices"][0]["message"]["content"]
    return _parse_vision_json(text)


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


@router.post("/identify-medicine")
async def identify_medicine(payload: MedicineImage):
    """Identify a medicine + product details from a photo of its box.

    Tries the configured vision providers in order (Gemini -> OpenAI -> Groq)
    and returns the first successful result, mirroring the /ask fallback chain.
    """
    # Strip a possible data-URL prefix so we always send raw base64
    image_b64 = payload.image
    if "," in image_b64 and image_b64.strip().startswith("data:"):
        image_b64 = image_b64.split(",", 1)[1]
    mime_type = payload.mime_type

    # Build the provider chain from whichever keys are configured.
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
        providers.append(("gemini", _FALLBACK_KEY))

    errors = []

    async with httpx.AsyncClient() as client:
        for name, key in providers:
            try:
                if name == "gemini":
                    result = await _vision_gemini(client, image_b64, mime_type, key)
                elif name == "openai":
                    result = await _vision_openai_compatible(
                        client,
                        image_b64,
                        mime_type,
                        url="https://api.openai.com/v1/chat/completions",
                        api_key=key,
                        model=os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini"),
                    )
                elif name == "xai":
                    result = await _vision_openai_compatible(
                        client,
                        image_b64,
                        mime_type,
                        url="https://api.x.ai/v1/chat/completions",
                        api_key=key,
                        model=os.getenv("XAI_VISION_MODEL", "grok-4"),
                    )
                else:  # groq
                    result = await _vision_openai_compatible(
                        client,
                        image_b64,
                        mime_type,
                        url="https://api.groq.com/openai/v1/chat/completions",
                        api_key=key,
                        model=os.getenv(
                            "GROQ_VISION_MODEL",
                            "meta-llama/llama-4-scout-17b-16e-instruct",
                        ),
                    )

                print(f"[Vision] Used provider: {name}")

                if not result.get("name"):
                    return {
                        **{f: None for f in VISION_FIELDS},
                        "provider": name,
                        "message": "لم نتمكن من التعرف على اسم الدواء في الصورة",
                    }

                return {**result, "provider": name}

            except httpx.HTTPStatusError as e:
                detail = e.response.text[:200]
                print(f"[Vision] {name} failed: {e.response.status_code} {detail}")
                errors.append(f"{name}: HTTP {e.response.status_code}")
            except Exception as e:
                print(f"[Vision] {name} error: {e}")
                errors.append(f"{name}: {str(e)}")

    raise HTTPException(
        status_code=502,
        detail=f"فشل تحليل صورة الدواء ({'; '.join(errors)})",
    )
