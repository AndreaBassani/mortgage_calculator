@echo off
echo Starting Mortgage Calculator...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
