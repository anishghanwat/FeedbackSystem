from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from services import (
    create_feedback, get_feedback_by_id, update_feedback, acknowledge_feedback, 
    unacknowledge_feedback, get_manager_feedback, get_employee_feedback, 
    get_dashboard_stats, delete_feedback, create_feedback_request, 
    get_feedback_requests_for_manager, get_feedback_requests_for_employee, 
    complete_feedback_request, add_feedback_comment, get_all_tags,
    update_feedback_comment, delete_feedback_comment
)
from .auth import get_current_active_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/", response_model=schemas.Feedback)
def create_new_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    return create_feedback(feedback, current_user.id, db)

@router.get("/", response_model=List[schemas.Feedback])
def get_feedback(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role == "manager":
        return get_manager_feedback(current_user.id, db)
    else:
        return get_employee_feedback(current_user.id, db)

@router.get("/{feedback_id}", response_model=schemas.Feedback)
def get_feedback_by_id_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    feedback = get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if current_user.role == "employee" and feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "manager" and feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return feedback

@router.put("/{feedback_id}", response_model=schemas.Feedback)
def update_feedback_endpoint(
    feedback_id: int,
    feedback_update: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    feedback = update_feedback(feedback_id, feedback_update, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return feedback

@router.post("/{feedback_id}/acknowledge", response_model=schemas.Feedback)
def acknowledge_feedback_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    feedback = acknowledge_feedback(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return feedback

@router.post("/{feedback_id}/unacknowledge", response_model=schemas.Feedback)
def unacknowledge_feedback_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can unacknowledge feedback")
    feedback = unacknowledge_feedback(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return feedback

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role == "manager":
        feedback_list = get_manager_feedback(current_user.id, db)
    else:
        feedback_list = get_employee_feedback(current_user.id, db)
    
    total_feedback = len(feedback_list)
    positive_feedback = len([f for f in feedback_list if f.sentiment.value == "positive"])
    neutral_feedback = len([f for f in feedback_list if f.sentiment.value == "neutral"])
    negative_feedback = len([f for f in feedback_list if f.sentiment.value == "negative"])
    acknowledged_feedback = len([f for f in feedback_list if f.acknowledged])
    
    return schemas.DashboardStats(
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
    current_user: schemas.User = Depends(get_current_active_user)
):
    feedback = get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete feedback")
    if feedback.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted successfully"}

@router.post("/feedback-requests/", response_model=schemas.FeedbackRequest)
def create_feedback_request_endpoint(
    request: schemas.FeedbackRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request feedback")
    feedback_request = create_feedback_request(current_user.id, request.manager_id, db)
    return schemas.FeedbackRequest.model_validate(feedback_request)

@router.get("/feedback-requests/", response_model=List[schemas.FeedbackRequest])
def get_feedback_requests_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role == "manager":
        requests = get_feedback_requests_for_manager(current_user.id, db)
    else:
        requests = get_feedback_requests_for_employee(current_user.id, db)
    return [schemas.FeedbackRequest.model_validate(r) for r in requests]

@router.patch("/feedback-requests/{request_id}/complete", response_model=schemas.FeedbackRequest)
def complete_feedback_request_endpoint(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can complete feedback requests")
    feedback_request = complete_feedback_request(request_id, db)
    if not feedback_request:
        raise HTTPException(status_code=404, detail="Feedback request not found")
    if feedback_request.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return schemas.FeedbackRequest.model_validate(feedback_request)

@router.post("/{feedback_id}/comment", response_model=schemas.Feedback)
def create_feedback_comment(
    feedback_id: int,
    comment_data: schemas.FeedbackComment,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Add a comment to a specific piece of feedback.
    Only the employee who received the feedback can add a comment.
    """
    if current_user.role != 'employee':
        raise HTTPException(status_code=403, detail="Only employees can comment on feedback.")
    
    return add_feedback_comment(db=db, feedback_id=feedback_id, comment=comment_data.comment, user_id=current_user.id)

@router.put("/{feedback_id}/comment", response_model=schemas.Feedback)
def update_comment_endpoint(
    feedback_id: int,
    comment_data: schemas.FeedbackCommentUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update an employee's comment on a specific piece of feedback.
    """
    return update_feedback_comment(db=db, feedback_id=feedback_id, comment=comment_data.comment, user_id=current_user.id)

@router.delete("/{feedback_id}/comment", response_model=schemas.Feedback)
def delete_comment_endpoint(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Delete an employee's comment from a specific piece of feedback.
    """
    return delete_feedback_comment(db=db, feedback_id=feedback_id, user_id=current_user.id)

@router.get("/tags/", response_model=List[schemas.Tag])
def list_tags(db: Session = Depends(get_db)):
    """
    Get a list of all available tags.
    """
    return get_all_tags(db) 