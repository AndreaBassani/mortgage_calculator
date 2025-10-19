#!/bin/bash

echo "Starting Mortgage Calculator..."
echo ""

echo "Starting Backend Server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

sleep 2

echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are running..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
