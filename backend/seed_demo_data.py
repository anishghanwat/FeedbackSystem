#!/usr/bin/env python3
"""
Seed the database with demo users and feedback for testing/demo purposes.
"""
from database import engine, SessionLocal
from models import Base, User, Feedback, UserRole, Sentiment, Tag
from services import get_password_hash
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Demo users
USERS = [
    # Managers
    {"name": "Alice Manager", "username": "manager1", "email": "alice.manager@example.com", "password": "manager123", "role": UserRole.MANAGER},
    {"name": "Bob Manager", "username": "manager2", "email": "bob.manager@example.com", "password": "manager123", "role": UserRole.MANAGER},
    # Employees
    {"name": "Charlie Employee", "username": "employee1", "email": "charlie.employee@example.com", "password": "employee123", "role": UserRole.EMPLOYEE},
    {"name": "Dana Employee", "username": "employee2", "email": "dana.employee@example.com", "password": "employee123", "role": UserRole.EMPLOYEE},
]

# Demo tags
TAGS = ["communication", "teamwork", "technical", "leadership", "punctuality"]

# Demo feedback
FEEDBACK = [
    # Feedback for employee1 from manager1
    {"manager_username": "manager1", "employee_username": "employee1", "strengths": "Great teamwork and communication.", "improvements": "Could improve punctuality.", "sentiment": Sentiment.POSITIVE, "acknowledged": True, "created_at": datetime.now() - timedelta(days=5), "tags": ["teamwork", "communication"]},
    {"manager_username": "manager1", "employee_username": "employee1", "strengths": "Very proactive in meetings.", "improvements": "Needs to document work more thoroughly.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=2), "tags": ["communication"]},
    # Feedback for employee2 from manager2
    {"manager_username": "manager2", "employee_username": "employee2", "strengths": "Excellent technical skills.", "improvements": "Should participate more in team discussions.", "sentiment": Sentiment.POSITIVE, "acknowledged": True, "created_at": datetime.now() - timedelta(days=3), "tags": ["technical"]},
    {"manager_username": "manager2", "employee_username": "employee2", "strengths": "Quick learner.", "improvements": "Needs to ask for help sooner when stuck.", "sentiment": Sentiment.NEGATIVE, "acknowledged": False, "created_at": datetime.now() - timedelta(days=1), "tags": ["technical", "teamwork"]},
]

def seed():
    print("Cleaning and seeding the database...")
    # Drop and recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Insert users
        user_objs = {}
        for user in USERS:
            db_user = User(
                name=user["name"],
                username=user["username"],
                email=user["email"],
                password_hash=get_password_hash(user["password"]),
                role=user["role"]
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            user_objs[user["username"]] = db_user
        print(f"Inserted {len(user_objs)} users.")

        # Insert tags
        tag_objs = {}
        for tag_name in TAGS:
            db_tag = Tag(name=tag_name)
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)
            tag_objs[tag_name] = db_tag
        print(f"Inserted {len(tag_objs)} tags.")

        # Insert feedback with tags
        for fb in FEEDBACK:
            db_feedback = Feedback(
                manager_id=user_objs[fb["manager_username"]].id,
                employee_id=user_objs[fb["employee_username"]].id,
                strengths=fb["strengths"],
                improvements=fb["improvements"],
                sentiment=fb["sentiment"],
                acknowledged=fb["acknowledged"],
                created_at=fb["created_at"]
            )
            # Add tags if they exist in the feedback entry
            if "tags" in fb:
                for tag_name in fb["tags"]:
                    if tag_name in tag_objs:
                        db_feedback.tags.append(tag_objs[tag_name])
            
            db.add(db_feedback)
        db.commit()
        print(f"Inserted {len(FEEDBACK)} feedback entries with tags.")
    finally:
        db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed() 