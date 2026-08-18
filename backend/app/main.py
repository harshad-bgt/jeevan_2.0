from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Jeevan 2.0 API",
    description="AI-Powered Blood Lifeline Backend",
    version="2.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, donors, requests, admin

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(auth.router, prefix="/api/users", tags=["Users (Legacy)"])
app.include_router(donors.router, prefix="/api/donors", tags=["Donors"])
app.include_router(requests.router, prefix="/api/requests", tags=["Requests"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Panel"])


@app.get("/")
async def root():
    return {"message": "Welcome to Jeevan 2.0 API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Jeevan 2.0 Backend"}
