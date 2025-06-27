#!/usr/bin/env python3
"""
Seed the database with comprehensive demo users and feedback for showcasing all use cases.
"""
from database import engine, SessionLocal
from models import Base, User, Feedback, UserRole, Sentiment, Tag, FeedbackRequest, FeedbackRequestStatus, Notification
from services import get_password_hash
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Demo users - Multiple managers and employees to showcase different scenarios
USERS = [
    # Senior Management
    {"name": "Sarah Johnson", "username": "sarah.johnson", "email": "sarah.johnson@techcorp.com", "password": "demo123", "role": UserRole.MANAGER},
    {"name": "Michael Chen", "username": "michael.chen", "email": "michael.chen@techcorp.com", "password": "demo123", "role": UserRole.MANAGER},
    {"name": "Emily Rodriguez", "username": "emily.rodriguez", "email": "emily.rodriguez@techcorp.com", "password": "demo123", "role": UserRole.MANAGER},
    
    # Team Leads
    {"name": "David Kim", "username": "david.kim", "email": "david.kim@techcorp.com", "password": "demo123", "role": UserRole.MANAGER},
    {"name": "Lisa Thompson", "username": "lisa.thompson", "email": "lisa.thompson@techcorp.com", "password": "demo123", "role": UserRole.MANAGER},
    
    # Senior Developers
    {"name": "Alex Turner", "username": "alex.turner", "email": "alex.turner@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Maria Garcia", "username": "maria.garcia", "email": "maria.garcia@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "James Wilson", "username": "james.wilson", "email": "james.wilson@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    
    # Mid-level Developers
    {"name": "Priya Patel", "username": "priya.patel", "email": "priya.patel@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Ryan O'Connor", "username": "ryan.oconnor", "email": "ryan.oconnor@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Sophie Anderson", "username": "sophie.anderson", "email": "sophie.anderson@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    
    # Junior Developers
    {"name": "Tommy Lee", "username": "tommy.lee", "email": "tommy.lee@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Nina Williams", "username": "nina.williams", "email": "nina.williams@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Carlos Martinez", "username": "carlos.martinez", "email": "carlos.martinez@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    
    # QA Engineers
    {"name": "Rachel Green", "username": "rachel.green", "email": "rachel.green@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
    {"name": "Kevin Zhang", "username": "kevin.zhang", "email": "kevin.zhang@techcorp.com", "password": "demo123", "role": UserRole.EMPLOYEE},
]

# Comprehensive tags covering different aspects of work
TAGS = [
    "technical-skills", "communication", "teamwork", "leadership", "punctuality", 
    "problem-solving", "documentation", "code-quality", "testing", "collaboration",
    "mentoring", "learning", "initiative", "reliability", "creativity", "adaptability",
    "time-management", "attention-to-detail", "customer-focus", "innovation"
]

# Comprehensive feedback data showcasing all use cases
FEEDBACK = [
    # ===== MANAGER TO EMPLOYEE FEEDBACK (Named, Not Anonymous) =====
    {
        "manager_username": "sarah.johnson", "employee_username": "alex.turner",
        "strengths": "**Exceptional technical leadership** and problem-solving skills. Alex consistently delivers high-quality code and mentors junior developers effectively.",
        "improvements": "Could improve **documentation practices** and participate more in cross-team initiatives.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(days=2),
        "created_at": datetime.now() - timedelta(days=10), "tags": ["technical-skills", "leadership", "mentoring"],
        "comment": "Thank you for the detailed feedback! I'll work on improving my documentation and cross-team collaboration.",
        "anonymous": False, "visible_to_manager": False
    },
    {
        "manager_username": "michael.chen", "employee_username": "maria.garcia",
        "strengths": "**Outstanding communication skills** and ability to explain complex technical concepts to non-technical stakeholders.",
        "improvements": "Sometimes takes on too many tasks simultaneously, which can affect delivery timelines.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=5), "tags": ["communication", "time-management"],
        "comment": None, "anonymous": False, "visible_to_manager": False
    },
    {
        "manager_username": "emily.rodriguez", "employee_username": "james.wilson",
        "strengths": "**Excellent debugging skills** and attention to detail in code reviews.",
        "improvements": "Needs to be more proactive in seeking feedback and could improve team collaboration.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(days=1),
        "created_at": datetime.now() - timedelta(days=8), "tags": ["technical-skills", "collaboration"],
        "comment": "I appreciate the feedback. I'll work on being more proactive and collaborative.",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== MANAGER TO EMPLOYEE FEEDBACK (Anonymous, Visible to Manager) =====
    {
        "manager_username": "david.kim", "employee_username": "priya.patel",
        "strengths": "**Great learning attitude** and always willing to take on new challenges.",
        "improvements": "Could improve code quality consistency and testing practices.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=3), "tags": ["learning", "code-quality", "testing"],
        "comment": "Anonymous feedback from manager - visible to manager but not to employee",
        "anonymous": True, "visible_to_manager": True
    },
    {
        "manager_username": "lisa.thompson", "employee_username": "ryan.oconnor",
        "strengths": "**Strong analytical thinking** and systematic approach to problem-solving.",
        "improvements": "Communication could be more concise and direct in team meetings.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(hours=12),
        "created_at": datetime.now() - timedelta(days=6), "tags": ["problem-solving", "communication"],
        "comment": "Anonymous manager feedback - visible to manager",
        "anonymous": True, "visible_to_manager": True
    },
    
    # ===== MANAGER TO EMPLOYEE FEEDBACK (Anonymous, Not Visible to Manager) =====
    {
        "manager_username": "sarah.johnson", "employee_username": "sophie.anderson",
        "strengths": "**Very reliable** and always meets deadlines. Great team player.",
        "improvements": "Could take more initiative in suggesting improvements to processes.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=4), "tags": ["reliability", "teamwork", "initiative"],
        "comment": "Anonymous feedback - manager cannot see who wrote this",
        "anonymous": True, "visible_to_manager": False
    },
    
    # ===== PEER TO PEER FEEDBACK (Named, Not Anonymous) =====
    {
        "manager_username": "alex.turner", "employee_username": "maria.garcia",
        "strengths": "**Amazing mentor** - always patient and explains things clearly to junior developers.",
        "improvements": "Could share knowledge more proactively in team meetings.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(days=1),
        "created_at": datetime.now() - timedelta(days=7), "tags": ["mentoring", "communication"],
        "comment": "Thanks Alex! I'll work on being more proactive in sharing knowledge.",
        "anonymous": False, "visible_to_manager": False
    },
    {
        "manager_username": "james.wilson", "employee_username": "priya.patel",
        "strengths": "**Great debugging partner** - always helpful when I'm stuck on complex issues.",
        "improvements": "Sometimes too focused on perfection, which can slow down delivery.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=2), "tags": ["collaboration", "attention-to-detail"],
        "comment": "Named peer feedback from James",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== PEER TO PEER FEEDBACK (Anonymous, Manager Cannot See Author) =====
    {
        "manager_username": "maria.garcia", "employee_username": "ryan.oconnor",
        "strengths": "**Excellent code reviewer** - catches important issues that others miss.",
        "improvements": "Could be more encouraging in code review comments.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=1), "tags": ["code-quality", "communication"],
        "comment": "Anonymous peer feedback - manager cannot see who wrote this",
        "anonymous": True, "visible_to_manager": False
    },
    {
        "manager_username": "sophie.anderson", "employee_username": "tommy.lee",
        "strengths": "**Very creative** in finding solutions to difficult problems.",
        "improvements": "Sometimes needs to follow established patterns instead of reinventing solutions.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(hours=6),
        "created_at": datetime.now() - timedelta(days=3), "tags": ["creativity", "problem-solving"],
        "comment": "Anonymous feedback from a peer",
        "anonymous": True, "visible_to_manager": False
    },
    
    # ===== PEER TO PEER FEEDBACK (Anonymous, Manager CAN See Author) =====
    {
        "manager_username": "nina.williams", "employee_username": "carlos.martinez",
        "strengths": "**Always on time** for meetings and very organized with tasks.",
        "improvements": "Could ask for help sooner when stuck on problems.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=2), "tags": ["punctuality", "collaboration"],
        "comment": "Anonymous to peer but visible to manager",
        "anonymous": True, "visible_to_manager": True
    },
    
    # ===== NEGATIVE FEEDBACK EXAMPLES =====
    {
        "manager_username": "michael.chen", "employee_username": "kevin.zhang",
        "strengths": "Good technical knowledge in testing frameworks.",
        "improvements": "**Critical issue**: Missing important test cases in recent releases. Need to improve test coverage and attention to detail.",
        "sentiment": Sentiment.NEGATIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=1), "tags": ["testing", "attention-to-detail"],
        "comment": "This needs immediate attention. Please review our testing procedures.",
        "anonymous": False, "visible_to_manager": False
    },
    {
        "manager_username": "rachel.green", "employee_username": "tommy.lee",
        "strengths": "Enthusiastic about new technologies.",
        "improvements": "**Major concern**: Code quality has declined recently. Many bugs in production due to rushed implementations.",
        "sentiment": Sentiment.NEGATIVE, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(hours=2),
        "created_at": datetime.now() - timedelta(days=4), "tags": ["code-quality", "reliability"],
        "comment": "I understand the concerns. I'll focus on quality over speed going forward.",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== SELF-FEEDBACK EXAMPLES =====
    {
        "manager_username": "alex.turner", "employee_username": "alex.turner",
        "strengths": "**Self-assessment**: Strong technical skills and good at mentoring others.",
        "improvements": "Need to improve work-life balance and delegate more effectively.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=5), "tags": ["leadership", "time-management"],
        "comment": "Self-reflection on areas for improvement",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== FEEDBACK WITH MARKDOWN FORMATTING =====
    {
        "manager_username": "emily.rodriguez", "employee_username": "nina.williams",
        "strengths": "# Strengths\n- **Excellent communication skills**\n- *Great team collaboration*\n- Strong problem-solving abilities\n\n## Key Achievements\n1. Led successful project delivery\n2. Mentored 3 junior developers\n3. Improved team processes",
        "improvements": "## Areas for Improvement\n\n### Priority 1\n- **Documentation**: Need more comprehensive code documentation\n- *Testing*: Increase unit test coverage\n\n### Priority 2\n- Cross-team collaboration\n- Technical presentation skills",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(days=6), "tags": ["communication", "mentoring", "documentation", "testing"],
        "comment": "**Manager's Comment**:\n\n> This feedback uses extensive markdown formatting to demonstrate the system's capabilities.\n\n- Bullet points\n- **Bold text**\n- *Italic text*\n- `Code snippets`\n- [Links](https://example.com)",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== FEEDBACK WITH MULTIPLE TAGS =====
    {
        "manager_username": "david.kim", "employee_username": "carlos.martinez",
        "strengths": "**Multi-faceted developer** with strong technical and soft skills.",
        "improvements": "Could improve time estimation accuracy and customer communication.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": True, "acknowledged_at": datetime.now() - timedelta(days=1),
        "created_at": datetime.now() - timedelta(days=9), "tags": ["technical-skills", "communication", "time-management", "customer-focus", "adaptability"],
        "comment": "Feedback with multiple tags to demonstrate filtering capabilities",
        "anonymous": False, "visible_to_manager": False
    },
    
    # ===== RECENT FEEDBACK (Last 24 hours) =====
    {
        "manager_username": "lisa.thompson", "employee_username": "kevin.zhang",
        "strengths": "**Quick learner** - picked up new testing framework in just a week.",
        "improvements": "Need to be more thorough in test case design.",
        "sentiment": Sentiment.POSITIVE, "acknowledged": False,
        "created_at": datetime.now() - timedelta(hours=4), "tags": ["learning", "testing"],
        "comment": "Recent feedback from today",
        "anonymous": False, "visible_to_manager": False
    },
    {
        "manager_username": "sophie.anderson", "employee_username": "rachel.green",
        "strengths": "**Great attention to detail** in bug reports.",
        "improvements": "Could improve automation skills for repetitive testing tasks.",
        "sentiment": Sentiment.NEUTRAL, "acknowledged": False,
        "created_at": datetime.now() - timedelta(hours=2), "tags": ["attention-to-detail", "testing"],
        "comment": "Very recent feedback",
        "anonymous": True, "visible_to_manager": False
    },
]

# Comprehensive feedback requests showcasing different scenarios
FEEDBACK_REQUESTS = [
    # Pending requests
    {"employee_username": "tommy.lee", "manager_username": "sarah.johnson", "status": FeedbackRequestStatus.PENDING, "created_at": datetime.now() - timedelta(days=3)},
    {"employee_username": "nina.williams", "manager_username": "michael.chen", "status": FeedbackRequestStatus.PENDING, "created_at": datetime.now() - timedelta(days=1)},
    {"employee_username": "carlos.martinez", "manager_username": "emily.rodriguez", "status": FeedbackRequestStatus.PENDING, "created_at": datetime.now() - timedelta(hours=6)},
    {"employee_username": "kevin.zhang", "manager_username": "david.kim", "status": FeedbackRequestStatus.PENDING, "created_at": datetime.now() - timedelta(hours=2)},
    
    # Completed requests
    {"employee_username": "alex.turner", "manager_username": "sarah.johnson", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=10), "completed_at": datetime.now() - timedelta(days=8)},
    {"employee_username": "maria.garcia", "manager_username": "michael.chen", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=7), "completed_at": datetime.now() - timedelta(days=5)},
    {"employee_username": "james.wilson", "manager_username": "emily.rodriguez", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=5), "completed_at": datetime.now() - timedelta(days=3)},
    {"employee_username": "priya.patel", "manager_username": "david.kim", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=4), "completed_at": datetime.now() - timedelta(days=2)},
    {"employee_username": "ryan.oconnor", "manager_username": "lisa.thompson", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=6), "completed_at": datetime.now() - timedelta(days=4)},
    {"employee_username": "sophie.anderson", "manager_username": "sarah.johnson", "status": FeedbackRequestStatus.COMPLETED, "created_at": datetime.now() - timedelta(days=8), "completed_at": datetime.now() - timedelta(days=6)},
]

# Comprehensive notifications showcasing different scenarios
NOTIFICATIONS = [
    # Welcome notifications
    {"user_username": "alex.turner", "message": "🎉 Welcome to the Feedback Management System! Start by requesting feedback from your manager.", "link": "/feedback-requests", "read": True},
    {"user_username": "maria.garcia", "message": "👋 Welcome! You can now give and receive feedback from your team members.", "link": "/dashboard", "read": True},
    {"user_username": "sarah.johnson", "message": "🔔 Welcome Manager! You can now manage feedback requests and view team feedback.", "link": "/dashboard", "read": True},
    
    # Feedback request notifications
    {"user_username": "sarah.johnson", "message": "📝 New feedback request from Tommy Lee", "link": "/feedback-requests", "read": False},
    {"user_username": "michael.chen", "message": "📝 New feedback request from Nina Williams", "link": "/feedback-requests", "read": False},
    {"user_username": "emily.rodriguez", "message": "📝 New feedback request from Carlos Martinez", "link": "/feedback-requests", "read": False},
    {"user_username": "david.kim", "message": "📝 New feedback request from Kevin Zhang", "link": "/feedback-requests", "read": False},
    
    # Feedback received notifications
    {"user_username": "alex.turner", "message": "💬 You received new feedback from Sarah Johnson", "link": "/feedback", "read": False},
    {"user_username": "maria.garcia", "message": "💬 You received new feedback from Michael Chen", "link": "/feedback", "read": False},
    {"user_username": "james.wilson", "message": "💬 You received new feedback from Emily Rodriguez", "link": "/feedback", "read": False},
    {"user_username": "priya.patel", "message": "💬 You received new feedback from David Kim", "link": "/feedback", "read": False},
    {"user_username": "ryan.oconnor", "message": "💬 You received new feedback from Lisa Thompson", "link": "/feedback", "read": False},
    
    # Acknowledgment notifications
    {"user_username": "sarah.johnson", "message": "✅ Alex Turner acknowledged your feedback", "link": "/feedback", "read": True},
    {"user_username": "michael.chen", "message": "✅ Maria Garcia acknowledged your feedback", "link": "/feedback", "read": True},
    {"user_username": "emily.rodriguez", "message": "✅ James Wilson acknowledged your feedback", "link": "/feedback", "read": True},
    
    # System notifications
    {"user_username": "sarah.johnson", "message": "📊 Monthly feedback summary is now available", "link": "/dashboard", "read": False},
    {"user_username": "michael.chen", "message": "📊 Monthly feedback summary is now available", "link": "/dashboard", "read": False},
    {"user_username": "alex.turner", "message": "🎯 You have 3 pending feedback requests to respond to", "link": "/feedback-requests", "read": False},
    {"user_username": "maria.garcia", "message": "🎯 You have 2 pending feedback requests to respond to", "link": "/feedback-requests", "read": False},
    
    # Recent notifications
    {"user_username": "kevin.zhang", "message": "⚠️ You received feedback that requires immediate attention", "link": "/feedback", "read": False},
    {"user_username": "tommy.lee", "message": "⚠️ You received feedback that requires immediate attention", "link": "/feedback", "read": False},
    {"user_username": "nina.williams", "message": "💬 You received anonymous feedback from a peer", "link": "/feedback", "read": False},
    {"user_username": "carlos.martinez", "message": "💬 You received anonymous feedback from a peer", "link": "/feedback", "read": False},
]

def seed():
    print("🌱 Cleaning and seeding the database with comprehensive demo data...")
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
        print(f"✅ Inserted {len(user_objs)} users (5 managers, 12 employees)")

        # Insert tags
        tag_objs = {}
        for tag_name in TAGS:
            db_tag = Tag(name=tag_name)
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)
            tag_objs[tag_name] = db_tag
        print(f"✅ Inserted {len(tag_objs)} tags")

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
            
            # Add acknowledged_at timestamp if feedback is acknowledged
            if fb.get("acknowledged_at"):
                db_feedback.acknowledged_at = fb["acknowledged_at"]
            
            # Add tags if they exist in the feedback entry
            if "tags" in fb:
                for tag_name in fb["tags"]:
                    if tag_name in tag_objs:
                        db_feedback.tags.append(tag_objs[tag_name])
            db.add(db_feedback)
        db.commit()
        print(f"✅ Inserted {len(FEEDBACK)} feedback entries with tags")

        # Insert feedback requests
        for req in FEEDBACK_REQUESTS:
            db_request = FeedbackRequest(
                employee_id=user_objs[req["employee_username"]].id,
                manager_id=user_objs[req["manager_username"]].id,
                status=req["status"],
                created_at=req.get("created_at", datetime.now())
            )
            
            # Add completed_at timestamp if request is completed
            if req.get("completed_at"):
                db_request.completed_at = req["completed_at"]
                
            db.add(db_request)
        db.commit()
        print(f"✅ Inserted {len(FEEDBACK_REQUESTS)} feedback requests (4 pending, 6 completed)")

        # Insert notifications
        for notif in NOTIFICATIONS:
            db_notification = Notification(
                user_id=user_objs[notif["user_username"]].id,
                message=notif["message"],
                link=notif["link"],
                read=notif.get("read", False)
            )
            db.add(db_notification)
        db.commit()
        print(f"✅ Inserted {len(NOTIFICATIONS)} notifications")

    finally:
        db.close()
    
    print("\n🎉 Comprehensive demo data seeding complete!")
    print("\n📋 Demo Data Summary:")
    print(f"   👥 Users: {len(USERS)} total (5 managers, 12 employees)")
    print(f"   🏷️  Tags: {len(TAGS)} different categories")
    print(f"   💬 Feedback: {len(FEEDBACK)} entries with various types:")
    print(f"      - Manager to Employee (named & anonymous)")
    print(f"      - Peer to Peer (named & anonymous)")
    print(f"      - Self-feedback")
    print(f"      - Positive, Neutral, and Negative sentiments")
    print(f"      - Acknowledged and unacknowledged")
    print(f"      - Markdown formatting examples")
    print(f"   📝 Feedback Requests: {len(FEEDBACK_REQUESTS)} (4 pending, 6 completed)")
    print(f"   🔔 Notifications: {len(NOTIFICATIONS)} various types")
    print("\n🔑 Demo Login Credentials:")
    print("   All users have password: demo123")
    print("   Manager usernames: sarah.johnson, michael.chen, emily.rodriguez, david.kim, lisa.thompson")
    print("   Employee usernames: alex.turner, maria.garcia, james.wilson, priya.patel, ryan.oconnor, sophie.anderson, tommy.lee, nina.williams, carlos.martinez, rachel.green, kevin.zhang")

if __name__ == "__main__":
    seed() 