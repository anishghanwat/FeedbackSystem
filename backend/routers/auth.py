from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import get_db, engine
from schemas import LoginRequest, LoginResponse, UserRegistration, RegistrationResponse, User as UserSchema
from services import authenticate_user, create_user, get_user_by_id
from models import User

router = APIRouter(prefix="/auth", tags=["authentication"])

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

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