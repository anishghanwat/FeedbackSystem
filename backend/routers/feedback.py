from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import FeedbackCreate, FeedbackUpdate, Feedback as FeedbackSchema, DashboardStats
from services import (
    create_feedback, get_feedback_by_id, update_feedback, acknowledge_feedback, unacknowledge_feedback,
    get_manager_feedback, get_employee_feedback, get_user_by_id
)
import jwt

router = APIRouter(prefix="/feedback", tags=["feedback"])

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        return get_user_by_id(user_id, db)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=FeedbackSchema)
def create_new_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    db_feedback = create_feedback(feedback, current_user.id, db)
    # Convert to Pydantic model
    return FeedbackSchema.model_validate(db_feedback)

@router.get("/", response_model=List[FeedbackSchema])
def get_feedback(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value == "manager":
        feedback_list = get_manager_feedback(current_user.id, db)
    else:
        feedback_list = get_employee_feedback(current_user.id, db)
    
    # Convert to Pydantic models
    return [FeedbackSchema.model_validate(feedback) for feedback in feedback_list]

@router.get("/{feedback_id}", response_model=FeedbackSchema)
def get_feedback_by_id_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    feedback = get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Check access permissions
    if current_user.role.value == "employee" and feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role.value == "manager" and feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FeedbackSchema.model_validate(feedback)

@router.put("/{feedback_id}", response_model=FeedbackSchema)
def update_feedback_endpoint(
    feedback_id: int,
    feedback_update: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    feedback = update_feedback(feedback_id, feedback_update, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FeedbackSchema.model_validate(feedback)

@router.post("/{feedback_id}/acknowledge", response_model=FeedbackSchema)
def acknowledge_feedback_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value != "employee":
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    feedback = acknowledge_feedback(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FeedbackSchema.model_validate(feedback)

@router.post("/{feedback_id}/unacknowledge", response_model=FeedbackSchema)
def unacknowledge_feedback_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value != "employee":
        raise HTTPException(status_code=403, detail="Only employees can unacknowledge feedback")
    feedback = unacknowledge_feedback(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return FeedbackSchema.model_validate(feedback)

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role.value == "manager":
        feedback_list = get_manager_feedback(current_user.id, db)
    else:
        feedback_list = get_employee_feedback(current_user.id, db)
    
    total_feedback = len(feedback_list)
    positive_feedback = len([f for f in feedback_list if f.sentiment.value == "positive"])
    neutral_feedback = len([f for f in feedback_list if f.sentiment.value == "neutral"])
    negative_feedback = len([f for f in feedback_list if f.sentiment.value == "negative"])
    acknowledged_feedback = len([f for f in feedback_list if f.acknowledged])
    
    return DashboardStats(
        total_feedback=total_feedback,
        positive_feedback=positive_feedback,
        neutral_feedback=neutral_feedback,
        negative_feedback=negative_feedback,
        acknowledged_feedback=acknowledged_feedback
    )

@router.delete("/{feedback_id}")
def delete_feedback_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    feedback = get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if current_user.role.value != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete feedback")
    if feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted successfully"} 