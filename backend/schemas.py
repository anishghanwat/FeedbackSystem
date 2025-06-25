from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, Sentiment

# User schemas
class UserBase(BaseModel):
    name: str
    username: str
    role: UserRole

    @validator('username')
    def validate_username(cls, v):
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 20:
            raise ValueError('Username must be less than 20 characters long')
        return v

class UserCreate(UserBase):
    password: str
    email: EmailStr

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    email: str
    
    class Config:
        from_attributes = True

# Registration schemas
class UserRegistration(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    role: UserRole

    @validator('username')
    def validate_username(cls, v):
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 20:
            raise ValueError('Username must be less than 20 characters long')
        return v

class RegistrationResponse(BaseModel):
    message: str
    user: User

# Feedback schemas
class FeedbackBase(BaseModel):
    strengths: str
    improvements: str
    sentiment: Sentiment

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    sentiment: Optional[Sentiment] = None

class Feedback(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    manager: User
    employee: User
    
    class Config:
        from_attributes = True

# Auth schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Dashboard schemas
class DashboardStats(BaseModel):
    total_feedback: int
    positive_feedback: int
    neutral_feedback: int
    negative_feedback: int
    acknowledged_feedback: int

class EmployeeFeedbackSummary(BaseModel):
    employee: User
    feedback_count: int
    last_feedback_date: Optional[datetime] = None 