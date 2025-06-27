"""
main.py - FastAPI application entry point for the Lightweight Feedback System.
Handles app creation, CORS setup, and router inclusion for authentication, feedback, users, and notifications.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import auth, feedback, users, notifications
import os

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
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
).split(",")

print("CORS allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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