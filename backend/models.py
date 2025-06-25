from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

# Association Table for Feedback <-> Tag
feedback_tags = Table('feedback_tags', Base.metadata,
    Column('feedback_id', Integer, ForeignKey('feedback.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class UserRole(str, enum.Enum):
    MANAGER = "manager"
    EMPLOYEE = "employee"

class Sentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class FeedbackRequestStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    feedback = relationship(
        "Feedback",
        secondary=feedback_tags,
        back_populates="tags"
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    disabled = Column(Boolean, default=False)
    
    # Relationships
    feedback_given = relationship("Feedback", foreign_keys="Feedback.manager_id", back_populates="manager")
    feedback_received = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")
    notifications = relationship("Notification", back_populates="user")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    strengths = Column(Text)
    improvements = Column(Text)
    sentiment = Column(Enum(Sentiment), default=Sentiment.NEUTRAL)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    comment = Column(String, nullable=True)
    
    # Relationships
    manager = relationship("User", foreign_keys=[manager_id], back_populates="feedback_given")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="feedback_received")
    tags = relationship(
        "Tag",
        secondary=feedback_tags,
        back_populates="feedback"
    )

class FeedbackRequest(Base):
    __tablename__ = "feedback_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(FeedbackRequestStatus), default=FeedbackRequestStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[manager_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    link = Column(String, nullable=True) # Optional link to navigate to on click

    user = relationship("User", back_populates="notifications") 