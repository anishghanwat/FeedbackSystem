from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import User, UserUpdate
from services import get_user_by_id, get_employees_for_manager, update_user, delete_user
import jwt

router = APIRouter(prefix="/users", tags=["users"])

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

@router.get("/profile", response_model=User)
def get_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/profile", response_model=User)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user profile"""
    updated_user = update_user(current_user.id, user_update, db)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete current user account"""
    success = delete_user(current_user.id, db)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}

@router.get("/employees", response_model=List[User])
def get_employees(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all employees (managers only)"""
    if current_user.role.value != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view employees")
    
    employees = get_employees_for_manager(current_user.id, db)
    return [User.model_validate(employee) for employee in employees] 