from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True) # E.g., 'user_123456789'
    name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=utcnow)
    
    # Store AI extracted style summary for personalization
    style_summary = Column(Text, nullable=True)

    chats = relationship("ChatSession", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"))
    title = Column(String(255), default="New Conversation")
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.timestamp")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("chat_sessions.id"))
    role = Column(String(50)) # 'user', 'assistant'
    content = Column(Text)
    emotion = Column(String(50), nullable=True) # Extracted emotion
    timestamp = Column(DateTime, default=utcnow)

    session = relationship("ChatSession", back_populates="messages")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=True) # Optional link to user
    rating = Column(Integer)
    text = Column(Text)
    email = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="feedbacks")
