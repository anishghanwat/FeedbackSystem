#!/bin/bash

echo "🚀 Setting up Lightweight Feedback System..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend
python -m pip install -r requirements.txt
echo "✅ Backend dependencies installed"

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Demo users:"
echo "  Manager: manager1 / manager123"
echo "  Employee: employee1 / employee123"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up --build" 