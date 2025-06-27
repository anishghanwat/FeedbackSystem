"""
main.py - FastAPI application entry point for the Lightweight Feedback System.
Handles app creation, CORS setup, and router inclusion for authentication, feedback, users, and notifications.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import models
import database
import os
from database import engine
from routers import auth, feedback, users, notifications

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lightweight Feedback System",
    description="A simple feedback system for managers and employees",
    version="1.0.0"
)

# CORS middleware setup
# FRONTEND_ORIGINS env var should be set to a comma-separated list of allowed frontend URLs
origins = os.environ.get(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,https://feedback-system-seven-delta.vercel.app"
).split(",")

print("CORS allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Register all API routers
app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(users.router)
app.include_router(notifications.router)

@app.get("/")
def read_root():
    """Root endpoint for health check or welcome message."""
    return {"message": "Welcome to the Feedback System API"}

@app.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"} 

@app.post("/seed-demo-data")
async def seed_demo_data():
    """
    Endpoint to seed demo data into the database.
    This should only be used in development or for initial setup.
    """
    try:
        # Import and run the seed function
        from seed_demo_data import seed
        seed()
        return {"message": "Demo data seeded successfully!", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error seeding data: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize database and seed demo data in development."""
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    # Seed demo data in development mode
    if os.getenv("ENVIRONMENT", "development") == "development":
        try:
            from seed_demo_data import seed
            seed()
            print("✅ Demo data seeded successfully!")
        except Exception as e:
            print(f"⚠️  Could not seed demo data: {e}") 