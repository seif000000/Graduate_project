# Start Musnad Full-Stack Application

# Start Backend
Write-Host "🚀 Starting FastAPI Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command",
 "cd backend; python -m uvicorn app.main:app --reload --port 8000"

# Start Frontend
Write-Host "🎨 Starting Vite Frontend..." -ForegroundColor Cyan
npm run dev
