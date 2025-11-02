@echo off
echo ========================================
echo SmartReview AI - Project Launcher
echo ========================================
echo.

:: Check if in correct directory
if not exist "backend" (
    echo Error: backend folder not found!
    echo Please run this script from smartreview-ai directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend folder not found!
    echo Please run this script from smartreview-ai directory.
    pause
    exit /b 1
)

echo [1] Starting Backend API Server...
echo.
cd backend
if not exist ".env" (
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please configure your OpenAI API key in backend/.env
    echo.
)

:: Start backend in new window
start cmd /k "echo Backend API Server && echo ================= && python -m venv venv 2>nul && venv\Scripts\activate && pip install -q -r requirements.txt && echo Starting API server... && python app/main.py"

echo [2] Starting Frontend Development Server...
echo.
cd ../frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating frontend .env...
    echo VITE_API_URL=http://localhost:8000 > .env
)

:: Wait a moment for backend to start
timeout /t 5 /nobreak > nul

:: Start frontend in new window
start cmd /k "echo Frontend Development Server && echo =========================== && npm run dev"

cd ..
echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend API: http://localhost:8000
echo API Docs:    http://localhost:8000/api/docs
echo Frontend:    http://localhost:3000
echo.
echo Press any key to open the browser...
pause > nul
start http://localhost:3000

echo.
echo Project is running!
echo Close this window to keep servers running.
pause