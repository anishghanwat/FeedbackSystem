from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import LoginRequest, LoginResponse, UserRegistration, RegistrationResponse
from services import authenticate_user, create_user
import jwt

router = APIRouter(prefix="/auth", tags=["authentication"])

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

@router.post("/register", response_model=RegistrationResponse)
def register(user_data: UserRegistration, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = create_user(user_data, db)
        return RegistrationResponse(
            message="User registered successfully",
            user=user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(login_data.username, login_data.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = jwt.encode(
        {"sub": str(user.id), "username": user.username, "role": user.role.value},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    ) 