from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import jwt
from passlib.context import CryptContext
import models
from models import User, Feedback, UserRole, Sentiment, FeedbackRequest, FeedbackRequestStatus, Tag
from schemas import FeedbackCreate, FeedbackUpdate, DashboardStats, EmployeeFeedbackSummary, UserRegistration, UserUpdate, Tag as TagSchema
from fastapi import HTTPException

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings (for demo purposes - in production use proper secret)
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(user_data: UserRegistration, db: Session) -> User:
    """Create a new user"""
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise ValueError("Username or email already registered")
    
    # Create new user
    db_user = User(
        name=user_data.name,
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(username: str, password: str, db: Session) -> Optional[User]:
    """Authenticate user against database"""
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID from database"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(username: str, db: Session) -> Optional[User]:
    """Get user by username from database"""
    return db.query(User).filter(User.username == username).first()

def update_user(user_id: int, user_update: UserUpdate, db: Session) -> Optional[User]:
    """Update user information"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Hash password if it's being updated
    if 'password' in update_data:
        update_data['password_hash'] = get_password_hash(update_data.pop('password'))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(user_id: int, db: Session) -> bool:
    """Delete user account"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    # Delete associated feedback
    db.query(Feedback).filter(
        (Feedback.manager_id == user_id) | (Feedback.employee_id == user_id)
    ).delete()
    
    # Delete user
    db.delete(user)
    db.commit()
    return True

def get_employees_for_manager(manager_id: int, db: Session) -> List[User]:
    """Get all employees for a manager"""
    return db.query(User).filter(User.role == UserRole.EMPLOYEE).all()

def create_feedback(feedback: FeedbackCreate, manager_id: int, db: Session) -> Feedback:
    db_feedback = Feedback(
        manager_id=manager_id,
        employee_id=feedback.employee_id,
        strengths=feedback.strengths,
        improvements=feedback.improvements,
        sentiment=feedback.sentiment
    )
    if feedback.tags:
        db_feedback.tags = get_or_create_tags(db, feedback.tags)
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_feedback_by_id(feedback_id: int, db: Session) -> Optional[Feedback]:
    return db.query(Feedback).filter(Feedback.id == feedback_id).first()

def update_feedback(feedback_id: int, feedback_update: FeedbackUpdate, db: Session) -> Optional[Feedback]:
    db_feedback = get_feedback_by_id(feedback_id, db)
    if not db_feedback:
        return None
    
    update_data = feedback_update.dict(exclude_unset=True)
    
    if 'tags' in update_data:
        db_feedback.tags = get_or_create_tags(db, update_data.pop('tags'))

    for field, value in update_data.items():
        setattr(db_feedback, field, value)
    
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def acknowledge_feedback(feedback_id: int, db: Session) -> Optional[Feedback]:
    db_feedback = get_feedback_by_id(feedback_id, db)
    if not db_feedback:
        return None
    db_feedback.acknowledged = True
    db_feedback.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def unacknowledge_feedback(feedback_id: int, db: Session) -> Optional[Feedback]:
    db_feedback = get_feedback_by_id(feedback_id, db)
    if not db_feedback:
        return None
    db_feedback.acknowledged = False
    db_feedback.acknowledged_at = None
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_manager_feedback(manager_id: int, db: Session) -> List[Feedback]:
    """
    Get all feedback given by a specific manager, including tags.
    """
    return db.query(Feedback).options(joinedload(Feedback.tags)).filter(Feedback.manager_id == manager_id).order_by(Feedback.created_at.desc()).all()

def get_employee_feedback(employee_id: int, db: Session) -> List[Feedback]:
    """
    Get all feedback for a specific employee, including their tags.
    """
    return db.query(Feedback).options(joinedload(Feedback.tags)).filter(Feedback.employee_id == employee_id).order_by(Feedback.created_at.desc()).all()

def get_dashboard_stats(user_id: int, role: UserRole, db: Session) -> DashboardStats:
    if role == UserRole.MANAGER:
        feedback_query = db.query(Feedback).filter(Feedback.manager_id == user_id)
    else:
        feedback_query = db.query(Feedback).filter(Feedback.employee_id == user_id)
    
    total_feedback = feedback_query.count()
    positive_feedback = feedback_query.filter(Feedback.sentiment == Sentiment.POSITIVE).count()
    neutral_feedback = feedback_query.filter(Feedback.sentiment == Sentiment.NEUTRAL).count()
    negative_feedback = feedback_query.filter(Feedback.sentiment == Sentiment.NEGATIVE).count()
    acknowledged_feedback = feedback_query.filter(Feedback.acknowledged == True).count()
    
    return DashboardStats(
        total_feedback=total_feedback,
        positive_feedback=positive_feedback,
        neutral_feedback=neutral_feedback,
        negative_feedback=negative_feedback,
        acknowledged_feedback=acknowledged_feedback
    )

def get_employee_summaries(manager_id: int, db: Session) -> List[EmployeeFeedbackSummary]:
    employees = get_employees_for_manager(manager_id, db)
    summaries = []
    
    for employee in employees:
        feedback_count = db.query(Feedback).filter(
            Feedback.manager_id == manager_id,
            Feedback.employee_id == employee.id
        ).count()
        
        last_feedback = db.query(Feedback).filter(
            Feedback.manager_id == manager_id,
            Feedback.employee_id == employee.id
        ).order_by(Feedback.created_at.desc()).first()
        
        summaries.append(EmployeeFeedbackSummary(
            employee=employee,
            feedback_count=feedback_count,
            last_feedback_date=last_feedback.created_at if last_feedback else None
        ))
    
    return summaries

def create_feedback_request(employee_id: int, manager_id: int, db: Session) -> FeedbackRequest:
    request = FeedbackRequest(
        employee_id=employee_id,
        manager_id=manager_id,
        status=FeedbackRequestStatus.PENDING
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

def get_feedback_requests_for_manager(manager_id: int, db: Session):
    return db.query(FeedbackRequest).filter(FeedbackRequest.manager_id == manager_id).all()

def get_feedback_requests_for_employee(employee_id: int, db: Session):
    return db.query(FeedbackRequest).filter(FeedbackRequest.employee_id == employee_id).all()

def complete_feedback_request(request_id: int, db: Session):
    request = db.query(FeedbackRequest).filter(FeedbackRequest.id == request_id).first()
    if not request:
        return None
    request.status = FeedbackRequestStatus.COMPLETED
    request.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return request

# Tag services
def get_or_create_tags(db: Session, tag_names: List[str]) -> List[Tag]:
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        if not name:
            continue
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tags.append(tag)
    return tags

def get_all_tags(db: Session) -> List[Tag]:
    return db.query(Tag).order_by(Tag.name).all()

def add_feedback_comment(db: Session, feedback_id: int, comment: str, user_id: int) -> Feedback:
    db_feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Ensure only the employee to whom the feedback was given can comment
    if db_feedback.employee_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this feedback")

    db_feedback.comment = comment
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def update_feedback_comment(db: Session, feedback_id: int, comment: str, user_id: int) -> Feedback:
    db_feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if db_feedback.employee_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    db_feedback.comment = comment
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def delete_feedback_comment(db: Session, feedback_id: int, user_id: int) -> Feedback:
    db_feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if db_feedback.employee_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db_feedback.comment = None
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def delete_feedback(db: Session, feedback_id: int) -> bool:
    """Deletes a feedback entry from the database."""
    db_feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if db_feedback:
        db.delete(db_feedback)
        db.commit()
        return True
    return False 