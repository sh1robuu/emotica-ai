from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Feedback
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

router = APIRouter()

class FeedbackCreate(BaseModel):
    rating: int
    text: str
    email: Optional[EmailStr] = None

@router.post("", status_code=201, summary="Submit Feedback", description="Saves a user feedback rating and text. User is optional.")
def submit_feedback(feedback_data: FeedbackCreate, db: Session = Depends(get_db)):
    feedback_id = f"fb_{uuid.uuid4().hex[:12]}"
    
    new_feedback = Feedback(
        id=feedback_id,
        rating=feedback_data.rating,
        text=feedback_data.text,
        email=feedback_data.email
    )
    
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    
    return {"message": "Feedback submitted successfully"}
