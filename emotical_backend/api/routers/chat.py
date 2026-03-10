from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, ChatSession, ChatMessage
from api.routers.auth import get_current_user
from services.llm import generate_llm_response
from worker.tasks import analyze_chat_style
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("", summary="Send Chat Message", description="Receives a chat message payload (Ollama compatible), processes it through the LLM with personalized context, and saves the history. Queues a background task to analyze chat style periodically.")
async def chat_endpoint(request: Request, db: Session = Depends(get_db)):
    """
    Handle chat messages.
    This endpoint tries to optionally extract a user from an Authorization header,
    but it will also work if no header is present (frontend compatibility).
    """
    # 1. Try to get user from token (optional)
    current_user = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            # We ignore token validation errors here to allow fallback for anonymous / unmigrated frontend calls
            current_user = get_current_user(token=token, db=db)
        except HTTPException:
            pass

    # 2. Extract Ollama payload from React frontend
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    messages = data.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="Messages list is required")

    # The last message is the user's new message
    user_message_data = next((m for m in reversed(messages) if m.get("role") == "user"), None)
    if not user_message_data:
        raise HTTPException(status_code=400, detail="No user message found")

    user_text = user_message_data.get("content", "")

    # 3. Handle Database storage if user is authenticated
    session_id = None
    if current_user:
        # Determine the session based on context (for simplicity, we create a new session if none exists,
        # or find the latest session. In a real app the frontend would pass session_id).
        # We'll just append to the most recent session or create one.
        chat_session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).first()
        if not chat_session:
            chat_session = ChatSession(id=f"chat_{uuid.uuid4().hex[:12]}", user_id=current_user.id)
            db.add(chat_session)
            db.commit()
            db.refresh(chat_session)
        
        session_id = chat_session.id
        
        # Save user message
        db_user_msg = ChatMessage(session_id=session_id, role="user", content=user_text)
        db.add(db_user_msg)
        db.commit()

    # 4. Generate AI response
    style_summary = current_user.style_summary if current_user else None
    ai_text = generate_llm_response(messages, style_summary)

    # 5. Save AI response to DB
    if current_user and session_id:
        db_ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_text)
        db.add(db_ai_msg)
        db.commit()

        # 6. Trigger background task (celery) every few messages to run summarization
        # Let's count messages in this session
        msg_count = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).count()
        if msg_count > 0 and msg_count % 5 == 0:
            analyze_chat_style.delay(current_user.id, session_id)

    # 7. Return Ollama-compatible response format so frontend emoticaService.js works out of the box
    return {
        "model": data.get("model", "ministral-3:14b-cloud"),
        "message": {
            "role": "assistant",
            "content": ai_text
        },
        "done": True
    }

@router.get("/sessions", summary="Get Chat Sessions", description="Retrieve all past conversation sessions for the authenticated user.")
def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all chat sessions for the current user."""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at} for s in sessions]

@router.get("/sessions/{session_id}/messages", summary="Get Chat Messages", description="Retrieve all messages for a specific conversation session.")
def get_session_messages(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get messages for a specific session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
    return [{"id": m.id, "role": m.role, "content": m.content, "emotion": m.emotion, "timestamp": m.timestamp} for m in messages]
