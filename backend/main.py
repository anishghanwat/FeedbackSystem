from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, feedback, users

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lightweight Feedback System",
    description="A simple feedback system for managers and employees",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Lightweight Feedback System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 