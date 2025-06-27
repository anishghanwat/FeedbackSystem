#!/bin/bash

echo "🚀 Deploying and seeding the Feedback Management System..."

# Build and start the containers
echo "📦 Building Docker containers..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for the backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Seed the database
echo "🌱 Seeding demo data..."
curl -X POST http://localhost:8000/seed-demo-data

echo "✅ Deployment and seeding complete!"
echo ""
echo "📋 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Demo Login Credentials:"
echo "   Password for all users: demo123"
echo "   Manager usernames: sarah.johnson, michael.chen, emily.rodriguez, david.kim, lisa.thompson"
echo "   Employee usernames: alex.turner, maria.garcia, james.wilson, priya.patel, ryan.oconnor, sophie.anderson, tommy.lee, nina.williams, carlos.martinez, rachel.green, kevin.zhang" 