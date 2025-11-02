@echo off
setlocal enabledelayedexpansion

echo =========================================
echo SmartReview AI - GitHub CLI Auto Deploy
echo =========================================
echo.

:: Check if gh is installed
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] GitHub CLI is not installed!
    echo Please install from: https://cli.github.com/
    pause
    exit /b 1
)

:: Check if logged in
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Logging into GitHub...
    gh auth login
)

echo [1] Creating GitHub Repository...
echo.

:: Get repository name
set REPO_NAME=smartreview-ai-%RANDOM%
set /p "CUSTOM_NAME=Enter repository name (or press Enter for %REPO_NAME%): "
if not "%CUSTOM_NAME%"=="" set REPO_NAME=%CUSTOM_NAME%

:: Create repository
echo Creating repository: %REPO_NAME%
gh repo create %REPO_NAME% --public --clone=false --description "AI-powered review generation system with SEO optimization" 2>nul

if %errorlevel% neq 0 (
    echo Repository already exists or error occurred. Continue? (y/n)
    set /p CONTINUE=
    if /i not "!CONTINUE!"=="y" exit /b 1
)

:: Get current GitHub username
for /f "tokens=*" %%i in ('gh api user -q .login') do set GH_USER=%%i
echo GitHub User: %GH_USER%
echo.

:: Initialize git if needed
if not exist ".git" (
    echo [2] Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: SmartReview AI"
) else (
    echo [2] Git repository already initialized
    git add .
    git commit -m "Update: Auto-deploy configuration" 2>nul
)

:: Add remote and push
echo.
echo [3] Pushing to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/%GH_USER%/%REPO_NAME%.git
git branch -M main
git push -u origin main --force

echo.
echo [4] Setting up GitHub Codespaces...
echo.

:: Create devcontainer configuration for Codespaces
if not exist ".devcontainer" mkdir .devcontainer

echo Creating Codespaces configuration...
(
echo {
echo   "name": "SmartReview AI",
echo   "image": "mcr.microsoft.com/devcontainers/python:3.11-node",
echo   "features": {
echo     "ghcr.io/devcontainers/features/node:1": {
echo       "version": "18"
echo     }
echo   },
echo   "postCreateCommand": "cd backend && pip install -r requirements.txt && cd ../frontend && npm install",
echo   "postStartCommand": "bash start.sh",
echo   "forwardPorts": [3000, 8000],
echo   "customizations": {
echo     "vscode": {
echo       "extensions": [
echo         "ms-python.python",
echo         "dbaeumer.vscode-eslint",
echo         "esbenp.prettier-vscode"
echo       ]
echo     }
echo   }
echo }
) > .devcontainer\devcontainer.json

git add .devcontainer
git commit -m "Add Codespaces configuration"
git push

echo.
echo [5] Creating GitHub Secrets for deployment...
echo.

:: Create secrets (you'll need to add your actual API keys)
echo Enter your OpenAI API key (or press Enter to skip):
set /p OPENAI_KEY=
if not "%OPENAI_KEY%"=="" (
    echo %OPENAI_KEY% | gh secret set OPENAI_API_KEY --repo=%GH_USER%/%REPO_NAME%
    echo Secret added: OPENAI_API_KEY
)

echo.
echo [6] Enabling GitHub Pages for frontend...
echo.

:: Create gh-pages workflow
if not exist ".github\workflows" mkdir .github\workflows

(
echo name: Deploy Frontend to GitHub Pages
echo.
echo on:
echo   push:
echo     branches: [main]
echo   workflow_dispatch:
echo.
echo permissions:
echo   contents: read
echo   pages: write
echo   id-token: write
echo.
echo jobs:
echo   build:
echo     runs-on: ubuntu-latest
echo     steps:
echo       - uses: actions/checkout@v3
echo       - uses: actions/setup-node@v3
echo         with:
echo           node-version: 18
echo       - name: Build Frontend
echo         run: ^|
echo           cd frontend
echo           npm ci
echo           npm run build
echo           cp -r dist ../public
echo       - uses: actions/upload-pages-artifact@v2
echo         with:
echo           path: ./public
echo.
echo   deploy:
echo     needs: build
echo     runs-on: ubuntu-latest
echo     environment:
echo       name: github-pages
echo       url: ${{ steps.deployment.outputs.page_url }}
echo     steps:
echo       - id: deployment
echo         uses: actions/deploy-pages@v2
) > .github\workflows\deploy-pages.yml

git add .github
git commit -m "Add GitHub Pages deployment"
git push

:: Enable GitHub Pages
gh api repos/%GH_USER%/%REPO_NAME%/pages --method POST --field source.branch=gh-pages --field source.path=/ 2>nul

echo.
echo [7] Launching Development Environments...
echo.

:: Menu for launching
echo.
echo Choose deployment option:
echo 1. Open in GitHub Codespaces (Full cloud development)
echo 2. Open in github.dev (Quick edit)
echo 3. Open in Replit (Import from GitHub)
echo 4. Open in StackBlitz (Browser IDE)
echo 5. View deployment URLs only
echo.

set /p CHOICE=Enter choice (1-5): 

if "%CHOICE%"=="1" (
    echo.
    echo Creating and opening Codespace...
    gh codespace create --repo %GH_USER%/%REPO_NAME% --branch main --machine basicLinux32gb
    timeout /t 5 /nobreak > nul
    gh codespace code --repo %GH_USER%/%REPO_NAME%
) else if "%CHOICE%"=="2" (
    echo Opening in github.dev...
    start https://github.dev/%GH_USER%/%REPO_NAME%
) else if "%CHOICE%"=="3" (
    echo Opening Replit import page...
    start https://replit.com/github/%GH_USER%/%REPO_NAME%
) else if "%CHOICE%"=="4" (
    echo Opening in StackBlitz...
    start https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
)

echo.
echo =========================================
echo DEPLOYMENT COMPLETE!
echo =========================================
echo.
echo Repository: https://github.com/%GH_USER%/%REPO_NAME%
echo.
echo Cloud Development Options:
echo - Codespaces: gh codespace create --repo %GH_USER%/%REPO_NAME%
echo - github.dev: https://github.dev/%GH_USER%/%REPO_NAME%
echo - Replit: https://replit.com/github/%GH_USER%/%REPO_NAME%
echo - StackBlitz: https://stackblitz.com/github/%GH_USER%/%REPO_NAME%
echo - CodeSandbox: https://codesandbox.io/s/github/%GH_USER%/%REPO_NAME%
echo.
echo GitHub Pages (Frontend):
echo https://%GH_USER%.github.io/%REPO_NAME%/
echo.
echo =========================================
echo.
pause