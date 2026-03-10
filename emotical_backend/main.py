from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import engine, Base

# In a production app, use Alembic for migrations instead of create_all on startup.
# We remove Base.metadata.create_all(bind=engine) here to prevent test config conflicts.

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for the Emotica AI Therapeutic Companion. Handles Authentication, Chat History, Emotion Tracking, and integrations with Ollama.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since frontend uses a proxy, or restrict to localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Emotica AI Backend Running"}

from api.routers import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

from api.routers import chat, feedback
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
