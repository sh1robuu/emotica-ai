import os
from worker.celery_app import celery_app
from db.database import SessionLocal
from db.models import User, ChatMessage, ChatSession
from services.llm import generate_user_style_summary

import logging
logger = logging.getLogger(__name__)

@celery_app.task(name="analyze_chat_style")
def analyze_chat_style(user_id: str, session_id: str):
    """
    Background task to analyze user's chat history in a session
    and update their global style summary.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"User {user_id} not found for background analysis.")
            return
        
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            logger.warning(f"Session {session_id} not found.")
            return

        messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
        # Keep recent messages for context
        recent_msgs = messages[-20:]
        
        # Build prompt format
        text_context = "\\n".join([f"{m.role}: {m.content}" for m in recent_msgs])
        
        summary = generate_user_style_summary(text_context, user.style_summary)
        if summary:
            user.style_summary = summary
            db.commit()
            logger.info(f"Updated style summary for user {user_id}")
            
    except Exception as e:
        logger.error(f"Error in analyze_chat_style: {str(e)}")
        db.rollback()
    finally:
        db.close()
