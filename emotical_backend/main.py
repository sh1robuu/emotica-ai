from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
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

templates = Jinja2Templates(directory="templates")

@app.get("/test", response_class=HTMLResponse, tags=["Test UI"])
async def test_page_index(request: Request):
    """Serve the interactive API test HTML index page."""
    return templates.TemplateResponse("test_index.html", {"request": request})

@app.get("/test/{page}", response_class=HTMLResponse, tags=["Test UI"])
async def test_page_dynamic(request: Request, page: str):
    """Serve dynamic modular testing pages (auth, chat, rag, media)."""
    import os
    template_name = f"test_{page}.html"
    if not os.path.exists(f"templates/{template_name}"):
        return templates.TemplateResponse("test_index.html", {"request": request})
    return templates.TemplateResponse(template_name, {"request": request})

from api.routers import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

from api.routers import chat, feedback, rag, speech, vision, memory, admin
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Document Processing"])
app.include_router(speech.router, prefix="/api/speech", tags=["Advanced Speech Integrations"])
app.include_router(vision.router, prefix="/api/vision", tags=["Computer Vision Features"])
app.include_router(memory.router, prefix="/api/memory", tags=["User AI Memory Context"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Tools"])
