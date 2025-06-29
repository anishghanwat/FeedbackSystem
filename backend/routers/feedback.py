from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from copy import deepcopy

import schemas
from database import get_db
from services import (
    create_feedback, get_feedback_by_id, update_feedback, acknowledge_feedback, 
    unacknowledge_feedback, get_manager_feedback, get_employee_feedback, 
    get_dashboard_stats, delete_feedback, create_feedback_request, 
    get_feedback_requests_for_manager, get_feedback_requests_for_employee, 
    complete_feedback_request, add_feedback_comment, get_all_tags,
    update_feedback_comment, delete_feedback_comment, get_feedback_trends, get_ack_rate_trends, get_top_tags, get_unacknowledged_feedback,
    get_employee_feedback_trends, get_employee_sentiment_trends, get_employee_top_tags, get_employee_ack_status
)
from .auth import get_current_active_user
from models import Feedback, User
from email_utils import send_email

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/", response_model=schemas.Feedback)
async def create_new_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Allow managers to create feedback (anonymous or not)
    if current_user.role == "manager":
        fb = create_feedback(feedback, current_user.id, db)
        # Send email to employee
        employee = db.query(User).filter(User.id == feedback.employee_id).first()
        if employee and employee.email:
            subject = "You have new feedback!"
            body = f"<p>Hi {employee.name},</p><p>You have received new feedback from your manager.</p>"
            await send_email(subject, [employee.email], body)
        return fb
    # Allow employees to create peer-to-peer feedback (anonymous or not)
    elif current_user.role == "employee":
        # Only allow employee to employee feedback
        employee = db.query(User).filter(User.id == feedback.employee_id).first()
        if not employee or employee.role != "employee":
            raise HTTPException(status_code=400, detail="Peer feedback can only be sent to other employees.")
        return create_feedback(feedback, current_user.id, db)
    else:
        raise HTTPException(status_code=403, detail="Only managers and employees can create feedback.")

@router.get("/", response_model=List[schemas.Feedback])
def get_feedback(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role == "manager":
        feedback_list = db.query(Feedback).options(
            joinedload(Feedback.manager),
            joinedload(Feedback.employee),
            joinedload(Feedback.tags)
        ).filter(
            (Feedback.anonymous == True) |
            (Feedback.manager_id == current_user.id)
        ).order_by(Feedback.created_at.desc()).all()
    else:
        feedback_list = db.query(Feedback).options(
            joinedload(Feedback.manager),
            joinedload(Feedback.employee),
            joinedload(Feedback.tags)
        ).filter(
            (Feedback.anonymous == True) |
            ((Feedback.employee_id == current_user.id) & (Feedback.anonymous == False))
        ).order_by(Feedback.created_at.desc()).all()
    # Mask author for anonymous feedback
    masked_feedback = []
    for fb in feedback_list:
        fb_copy = deepcopy(fb)
        if fb_copy.anonymous:
            # If manager and visible_to_manager is True, show author
            if current_user.role == "manager" and fb_copy.visible_to_manager:
                pass
            # If current user is the author, show author
            elif fb_copy.manager_id == current_user.id:
                pass
            else:
                # Mask manager (author) info
                fb_copy.manager = None
        masked_feedback.append(fb_copy)
    return masked_feedback

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
    # Mask author for anonymous feedback
    fb_copy = deepcopy(feedback)
    if fb_copy.anonymous:
        if (current_user.role == "manager" and fb_copy.visible_to_manager) or (fb_copy.manager_id == current_user.id):
            pass
        else:
            fb_copy.manager = None
    return fb_copy

@router.put("/{feedback_id}", response_model=schemas.Feedback)
def update_feedback_endpoint(
    feedback_id: int,
    feedback_update: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    feedback = get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    # Allow managers to edit their own feedback
    if current_user.role == "manager" and feedback.manager_id == current_user.id:
        pass
    # Allow employees to edit their own peer-to-peer feedback
    elif current_user.role == "employee" and feedback.manager_id == current_user.id and feedback.employee_id != current_user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    feedback = update_feedback(feedback_id, feedback_update, db)
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
    # Allow managers to delete their own feedback
    if current_user.role == "manager" and feedback.manager_id == current_user.id:
        pass
    # Allow employees to delete their own peer-to-peer feedback
    elif current_user.role == "employee" and feedback.manager_id == current_user.id and feedback.employee_id != current_user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted successfully"}

@router.post("/feedback-requests/", response_model=schemas.FeedbackRequest)
async def create_feedback_request_endpoint(
    request: schemas.FeedbackRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request feedback")
    feedback_request = create_feedback_request(current_user.id, request.manager_id, db)
    # Send email to manager
    manager = db.query(User).filter(User.id == request.manager_id).first()
    if manager and manager.email:
        subject = "New Feedback Request"
        body = f"<p>Hi {manager.name},</p><p>You have received a new feedback request from {current_user.name}.</p>"
        await send_email(subject, [manager.email], body)
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

@router.get("/analytics/trends", response_model=schemas.FeedbackTrendList)
def feedback_trends(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    days: int = 30
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view this analytic.")
    data = get_feedback_trends(current_user.id, db, days)
    return {"trends": data}

@router.get("/analytics/ack_rate", response_model=schemas.AckRateTrendList)
def ack_rate_trends(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    days: int = 30
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view this analytic.")
    data = get_ack_rate_trends(current_user.id, db, days)
    return {"trends": data}

@router.get("/analytics/top-tags", response_model=schemas.TopTagList)
def top_tags(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    top_n: int = 10
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view this analytic.")
    data = get_top_tags(current_user.id, db, top_n)
    return {"tags": data}

@router.get("/analytics/unacknowledged", response_model=schemas.UnacknowledgedFeedbackList)
def unacknowledged_feedback(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view this analytic.")
    data = get_unacknowledged_feedback(current_user.id, db)
    return {"feedback": data}

@router.get("/analytics/employee/trends", response_model=schemas.FeedbackTrendList)
def employee_feedback_trends(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    days: int = 30
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can view this analytic.")
    data = get_employee_feedback_trends(current_user.id, db, days)
    return {"trends": data}

@router.get("/analytics/employee/sentiment", response_model=schemas.EmployeeSentimentTrendList)
def employee_sentiment_trends(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    days: int = 30
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can view this analytic.")
    data = get_employee_sentiment_trends(current_user.id, db, days)
    return {"trends": data}

@router.get("/analytics/employee/top-tags", response_model=schemas.TopTagList)
def employee_top_tags(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user),
    top_n: int = 10
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can view this analytic.")
    data = get_employee_top_tags(current_user.id, db, top_n)
    return {"tags": data}

@router.get("/analytics/employee/ack-status", response_model=schemas.EmployeeAckStatusResponse)
def employee_ack_status(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can view this analytic.")
    data = get_employee_ack_status(current_user.id, db)
    return {"status": data} 