#!/usr/bin/env python3
"""
Test script to verify database initialization and basic functionality
"""

from database import SessionLocal, engine
from models import Base
from services import initialize_database, authenticate_user
from sqlalchemy.orm import Session

def test_database():
    print("Testing database initialization...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")
    
    # Initialize with mock users
    db = SessionLocal()
    try:
        initialize_database(db)
        print("✓ Mock users initialized")
        
        # Test authentication
        user = authenticate_user("manager1", "manager123", db)
        if user:
            print(f"✓ Authentication works for manager1: {user.name} ({user.role.value})")
        else:
            print("✗ Authentication failed for manager1")
            
        user = authenticate_user("employee1", "employee123", db)
        if user:
            print(f"✓ Authentication works for employee1: {user.name} ({user.role.value})")
        else:
            print("✗ Authentication failed for employee1")
            
        # Count users
        user_count = db.query(user.__class__).count()
        print(f"✓ Total users in database: {user_count}")
        
    finally:
        db.close()
    
    print("Database test completed!")

if __name__ == "__main__":
    test_database() 