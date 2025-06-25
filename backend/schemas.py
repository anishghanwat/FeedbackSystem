from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, Sentiment, FeedbackRequestStatus, Tag

# Tag Schemas
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    name: str
    username: str
    role: UserRole
    email: EmailStr
    full_name: Optional[str] = None

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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    disabled: Optional[bool] = None
    
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
    tags: Optional[List[str]] = []

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    sentiment: Optional[Sentiment] = None
    tags: Optional[List[str]] = []

class Feedback(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    comment: Optional[str] = None
    manager: "User"
    employee: "User"
    tags: List["Tag"] = []

    class Config:
        from_attributes = True

class FeedbackComment(BaseModel):
    comment: str

class FeedbackCommentUpdate(BaseModel):
    comment: str

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

# FeedbackRequest schemas
class FeedbackRequestBase(BaseModel):
    employee_id: int
    manager_id: int

class FeedbackRequestCreate(BaseModel):
    manager_id: int

class FeedbackRequestUpdate(BaseModel):
    status: FeedbackRequestStatus
    completed_at: Optional[datetime] = None

class FeedbackRequest(FeedbackRequestBase):
    id: int
    status: FeedbackRequestStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    employee: User
    manager: User

    class Config:
        from_attributes = True

class Notification(BaseModel):
    id: int
    user_id: int
    message: str
    read: bool
    created_at: datetime
    link: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str 