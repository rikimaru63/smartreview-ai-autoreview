#!/bin/bash

echo "========================================="
echo "SmartReview AI - Auto Start"
echo "========================================="
echo ""

# Backend setup and start
echo "[1] Setting up Backend..."
cd backend

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Please set OPENAI_API_KEY in backend/.env"
fi

# Install Python dependencies
pip install -q -r requirements.txt

# Start backend in background
echo "Starting Backend API..."
python app/main.py &
BACKEND_PID=$!

cd ..

# Frontend setup and start  
echo ""
echo "[2] Setting up Frontend..."
cd frontend

# Create .env if not exists
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:8000" > .env
fi

# Install dependencies
npm install --silent

# Build and serve
echo "Building Frontend..."
npm run build

echo "Starting Frontend Server..."
npx serve -s dist -l 3000 &
FRONTEND_PID=$!

cd ..

echo ""
echo "========================================="
echo "Application is running!"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "========================================="
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID