@echo off
:: SmartReview AI - GitHub CLI One-Click Deploy & Launch
:: This script does EVERYTHING automatically

echo =========================================
echo    SmartReview AI - Auto Deploy          
echo    One-Click Cloud Deployment            
echo =========================================
echo.

:: Check gh CLI
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing GitHub CLI...
    winget install GitHub.cli
    if %errorlevel% neq 0 (
        echo Please install GitHub CLI manually from: https://cli.github.com/
        pause
        exit /b 1
    )
)

:: Auto-login if needed
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo Please login to GitHub:
    gh auth login --web
)

:: Get username
for /f "tokens=*" %%i in ('gh api user -q .login') do set GH_USER=%%i

:: Generate unique repo name
set REPO_NAME=smartreview-ai-%RANDOM%

echo Creating repository: %REPO_NAME%
echo.

:: Create repo silently
gh repo create %REPO_NAME% --public --clone=false -d "SmartReview AI" >nul 2>&1

:: Git operations
echo Uploading code to GitHub...
if not exist ".git" git init >nul 2>&1
git add . >nul 2>&1
git commit -m "Deploy SmartReview AI" >nul 2>&1
git branch -M main >nul 2>&1
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%GH_USER%/%REPO_NAME%.git >nul 2>&1
git push -u origin main --force >nul 2>&1

echo.
echo =========================================
echo    INSTANT CLOUD ACCESS READY!           
echo =========================================
echo.
echo Your app is now available at:
echo.
echo [1] GitHub Codespace (Full IDE):
echo     https://github.com/codespaces/new?repo=%GH_USER%/%REPO_NAME%
echo.
echo [2] StackBlitz (Instant):
echo     https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
echo.
echo [3] CodeSandbox (Team-friendly):
echo     https://codesandbox.io/s/github/%GH_USER%/%REPO_NAME%
echo.
echo [4] Replit (Auto-run):
echo     https://replit.com/github/%GH_USER%/%REPO_NAME%
echo.
echo [5] github.dev (Quick edit):
echo     https://github.dev/%GH_USER%/%REPO_NAME%
echo.
echo =========================================
echo.
echo Press number to open (1-5) or Enter to skip:
set /p OPEN_CHOICE=

if "%OPEN_CHOICE%"=="1" start https://github.com/codespaces/new?repo=%GH_USER%/%REPO_NAME%
if "%OPEN_CHOICE%"=="2" start https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
if "%OPEN_CHOICE%"=="3" start https://codesandbox.io/s/github/%GH_USER%/%REPO_NAME%
if "%OPEN_CHOICE%"=="4" start https://replit.com/github/%GH_USER%/%REPO_NAME%
if "%OPEN_CHOICE%"=="5" start https://github.dev/%GH_USER%/%REPO_NAME%

:: Create a quick re-launch file
(
echo @echo off
echo echo Quick Launch - SmartReview AI
echo echo.
echo echo 1. Codespace:  https://github.com/codespaces/new?repo=%GH_USER%/%REPO_NAME%
echo echo 2. StackBlitz: https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
echo echo 3. Repository: https://github.com/%GH_USER%/%REPO_NAME%
echo echo.
echo set /p N=Open which? (1-3^): 
echo if "%%N%%"=="1" start https://github.com/codespaces/new?repo=%GH_USER%/%REPO_NAME%
echo if "%%N%%"=="2" start https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
echo if "%%N%%"=="3" start https://github.com/%GH_USER%/%REPO_NAME%
) > QUICK_ACCESS_%REPO_NAME%.bat

echo.
echo Quick access file created: QUICK_ACCESS_%REPO_NAME%.bat
echo.
pause