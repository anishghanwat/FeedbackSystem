from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List
import services
import schemas
from database import get_db
from routers.auth import get_current_active_user
from models import User, UserRole

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/profile", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    """
    Get current user's profile.
    """
    return current_user

@router.put("/profile", response_model=schemas.User)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """Update current user profile"""
    updated_user = services.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """Delete current user account"""
    success = services.delete_user(db, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}

@router.get("/employees", response_model=List[schemas.User])
def get_employees(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """Get all employees (for managers and employees)"""
    # Allow both managers and employees
    employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).all()
    return employees

@router.get("/managers", response_model=List[schemas.User])
def get_managers(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """Get all managers (for employees to request feedback)"""
    # Allow both managers and employees to see managers
    managers = db.query(User).filter(User.role == UserRole.MANAGER).all()
    return managers

@router.get("/employee/{employee_id}/feedback", response_model=List[schemas.Feedback])
def get_all_feedback_for_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can access this.")
    feedback = services.get_employee_feedback(employee_id, db)
    return feedback 