from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db.models import User, UserMemory
from api.routers.auth import get_current_user

router = APIRouter()

class MemoryPayload(BaseModel):
    memory_text: str

@router.get("", summary="Get User Memory", description="Fetch the persisted AI memory for the current user.")
def get_memory(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memory = db.query(UserMemory).filter(UserMemory.user_id == current_user.id).first()
    return {"memory_text": memory.memory_text if memory else ""}

@router.post("", summary="Update User Memory", description="Update the user's AI memory context. Limited to approx 4000 tokens.")
def update_memory(payload: MemoryPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Rough token check (1 word ~ 1.3 tokens). 4000 tokens ~ 3000 words.
    word_count = len(payload.memory_text.split())
    if word_count > 3500:
        raise HTTPException(status_code=400, detail="Memory exceeds maximum token limit (approx 4000 tokens).")
        
    memory = db.query(UserMemory).filter(UserMemory.user_id == current_user.id).first()
    if not memory:
        memory = UserMemory(user_id=current_user.id, memory_text=payload.memory_text)
        db.add(memory)
    else:
        memory.memory_text = payload.memory_text
        
    db.commit()
    db.refresh(memory)
    return {"status": "success", "memory_text": memory.memory_text}
