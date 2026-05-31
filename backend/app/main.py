from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, medicine, requests, chat, inventory, users, vouchers, medical_history, inbox, dashboard
from app.db.database import init_db

app = FastAPI(title="Musnad API", description="API for Musnad Medicine Donation Platform")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_V1_STR = "/api/v1"

# Include routers
app.include_router(auth.router, prefix=API_V1_STR)
app.include_router(medicine.router, prefix=API_V1_STR)
app.include_router(requests.router, prefix=API_V1_STR)
app.include_router(chat.router, prefix=API_V1_STR, tags=["chat"])
app.include_router(inventory.router, prefix=f"{API_V1_STR}/inventory", tags=["inventory"])
app.include_router(users.router, prefix=f"{API_V1_STR}/users", tags=["users"])
app.include_router(vouchers.router, prefix=f"{API_V1_STR}/vouchers", tags=["vouchers"])
app.include_router(medical_history.router, prefix=f"{API_V1_STR}/medical-history", tags=["medical-history"])
app.include_router(inbox.router, prefix=f"{API_V1_STR}/inbox", tags=["inbox"])
app.include_router(dashboard.router, prefix=f"{API_V1_STR}/dashboard", tags=["dashboard"])

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Welcome to Musnad API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
