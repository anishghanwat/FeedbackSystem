#!/usr/bin/env python3
"""
Seed the database with demo users and feedback for testing/demo purposes.
"""
from database import engine, SessionLocal
from models import Base, User, Feedback, UserRole, Sentiment, Tag, FeedbackRequest, FeedbackRequestStatus, Notification
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
    # Manager to employee feedback (named, not anonymous)
    {"manager_username": "manager1", "employee_username": "employee1", "strengths": "Great teamwork and communication.", "improvements": "Could improve punctuality.", "sentiment": Sentiment.POSITIVE, "acknowledged": True, "created_at": datetime.now() - timedelta(days=5), "tags": ["teamwork", "communication"], "comment": "Thanks for the feedback!", "anonymous": False, "visible_to_manager": False},
    {"manager_username": "manager1", "employee_username": "employee1", "strengths": "Very proactive in meetings.", "improvements": "Needs to document work more thoroughly.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=2), "tags": ["communication"], "comment": "# My Feedback\n- This is a *list item*\n- This is **bold**", "anonymous": False, "visible_to_manager": False},
    # Manager to employee feedback (anonymous, visible to manager)
    {"manager_username": "manager2", "employee_username": "employee2", "strengths": "**Excellent technical skills.**", "improvements": "Should participate more in team discussions.", "sentiment": Sentiment.POSITIVE, "acknowledged": True, "created_at": datetime.now() - timedelta(days=3), "tags": ["technical"], "comment": None, "anonymous": True, "visible_to_manager": True},
    # Manager to employee feedback (anonymous, not visible to manager)
    {"manager_username": "manager2", "employee_username": "employee1", "strengths": "Always willing to help.", "improvements": "Can improve documentation.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=4), "tags": [], "comment": "Anonymous manager feedback.", "anonymous": True, "visible_to_manager": False},
    # Peer to peer feedback (named, not anonymous)
    {"manager_username": "employee1", "employee_username": "employee2", "strengths": "Great at sharing knowledge.", "improvements": "Could be more proactive.", "sentiment": Sentiment.POSITIVE, "acknowledged": True, "created_at": datetime.now() - timedelta(days=6), "tags": ["teamwork", "technical"], "comment": "Named peer feedback.", "anonymous": False, "visible_to_manager": False},
    # Peer to peer feedback (anonymous, manager cannot see author)
    {"manager_username": "employee1", "employee_username": "employee2", "strengths": "Very helpful teammate.", "improvements": "Could share knowledge more proactively.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=1), "tags": ["teamwork"], "comment": "Peer feedback, submitted anonymously.", "anonymous": True, "visible_to_manager": False},
    # Peer to peer feedback (anonymous, manager CAN see author)
    {"manager_username": "employee2", "employee_username": "employee1", "strengths": "Always on time.", "improvements": "Should ask for help sooner.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=1), "tags": ["punctuality"], "comment": "Peer feedback, anonymous to peer but visible to manager.", "anonymous": True, "visible_to_manager": True},
    # Peer to peer feedback (anonymous, no tags, no comment)
    {"manager_username": "employee2", "employee_username": "employee2", "strengths": "Self feedback, testing edge case.", "improvements": "None.", "sentiment": Sentiment.NEUTRAL, "acknowledged": False, "created_at": datetime.now() - timedelta(days=1), "tags": [], "comment": None, "anonymous": True, "visible_to_manager": True},
    # Manager to employee feedback (multiple tags, markdown comment)
    {"manager_username": "manager2", "employee_username": "employee1", "strengths": "*Markdown* **test**", "improvements": "- List\n- Of\n- Improvements", "sentiment": Sentiment.NEGATIVE, "acknowledged": False, "created_at": datetime.now() - timedelta(days=2), "tags": ["leadership", "communication", "technical"], "comment": "**Manager's markdown comment**", "anonymous": False, "visible_to_manager": False},
]

# Demo feedback requests
FEEDBACK_REQUESTS = [
    {"employee_username": "employee1", "manager_username": "manager1", "status": FeedbackRequestStatus.PENDING},
    {"employee_username": "employee2", "manager_username": "manager2", "status": FeedbackRequestStatus.COMPLETED},
]

# Demo notifications
NOTIFICATIONS = [
    {"user_username": "employee1", "message": "Welcome to the system!", "link": "/dashboard"},
    {"user_username": "manager1", "message": "You have a new feedback request.", "link": "/feedback-requests"},
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
                created_at=fb["created_at"],
                comment=fb.get("comment"),
                anonymous=fb.get("anonymous", False),
                visible_to_manager=fb.get("visible_to_manager", False)
            )
            # Add tags if they exist in the feedback entry
            if "tags" in fb:
                for tag_name in fb["tags"]:
                    if tag_name in tag_objs:
                        db_feedback.tags.append(tag_objs[tag_name])
            db.add(db_feedback)
        db.commit()
        print(f"Inserted {len(FEEDBACK)} feedback entries with tags.")

        # Insert feedback requests
        for req in FEEDBACK_REQUESTS:
            db_request = FeedbackRequest(
                employee_id=user_objs[req["employee_username"]].id,
                manager_id=user_objs[req["manager_username"]].id,
                status=req["status"]
            )
            db.add(db_request)
        db.commit()
        print(f"Inserted {len(FEEDBACK_REQUESTS)} feedback requests.")

        # Insert notifications
        for notif in NOTIFICATIONS:
            db_notification = Notification(
                user_id=user_objs[notif["user_username"]].id,
                message=notif["message"],
                link=notif["link"]
            )
            db.add(db_notification)
        db.commit()
        print(f"Inserted {len(NOTIFICATIONS)} notifications.")

    finally:
        db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed() 