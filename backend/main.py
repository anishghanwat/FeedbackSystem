from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import auth, feedback, users

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lightweight Feedback System",
    description="A simple feedback system for managers and employees",
    version="1.0.0"
)

# Add CORS middleware
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    return {"message": "Welcome to the Feedback System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 