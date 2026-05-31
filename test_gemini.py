import os
import httpx
from dotenv import load_dotenv

load_dotenv('backend/.env')

api_key = os.getenv("GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = httpx.get(url, timeout=10.0)
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        models = response.json().get("models", [])
        for m in models:
            print(m["name"])
    else:
        print("Error Response:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
