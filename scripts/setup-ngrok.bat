@echo off
echo ========================================
echo SmartReview AI - ngrok Web Tunnel Setup
echo ========================================
echo.

:: Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ngrok is not installed. Installing...
    echo.
    
    :: Download ngrok
    echo Downloading ngrok...
    curl -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
    
    :: Extract ngrok
    echo Extracting ngrok...
    tar -xf ngrok.zip
    
    :: Clean up
    del ngrok.zip
    
    echo ngrok installed successfully!
    echo.
)

echo Starting local servers and creating web tunnels...
echo.

:: Start backend API
echo [1] Starting Backend API Server...
cd ..\backend
start /min cmd /c "python -m venv venv && venv\Scripts\activate && pip install -q -r requirements.txt && python app/main.py"

:: Wait for backend to start
timeout /t 5 /nobreak > nul

:: Start frontend
echo [2] Starting Frontend Server...
cd ..\frontend
start /min cmd /c "npm install && npm run build && npx serve -s dist -l 3000"

:: Wait for frontend to start
timeout /t 5 /nobreak > nul

:: Start ngrok tunnels
echo [3] Creating Web Tunnels...
echo.

cd ..\scripts

:: Create ngrok config
echo version: "2" > ngrok.yml
echo tunnels: >> ngrok.yml
echo   backend: >> ngrok.yml
echo     proto: http >> ngrok.yml
echo     addr: 8000 >> ngrok.yml
echo   frontend: >> ngrok.yml
echo     proto: http >> ngrok.yml
echo     addr: 3000 >> ngrok.yml

:: Start ngrok with both tunnels
start cmd /k "ngrok start --all --config ngrok.yml"

timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo Web Tunnels Created!
echo.
echo Your app is now accessible from the web!
echo Check the ngrok window for your public URLs.
echo.
echo Example URLs:
echo Frontend: https://xxxxx.ngrok.io
echo Backend:  https://yyyyy.ngrok.io
echo.
echo Note: Update frontend API URL with backend ngrok URL
echo ========================================
echo.
pause