# SmartReview AI - GitHub CLI Auto Deploy (PowerShell Version)
# More powerful version with additional features

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SmartReview AI - GitHub CLI Auto Deploy" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check command existence
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "[Checking Prerequisites...]" -ForegroundColor Yellow

if (-not (Test-Command gh)) {
    Write-Host "ERROR: GitHub CLI is not installed!" -ForegroundColor Red
    Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Command git)) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check GitHub CLI authentication
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging into GitHub..." -ForegroundColor Yellow
    gh auth login
}

# Get GitHub username
$ghUser = gh api user -q .login
Write-Host "GitHub User: $ghUser" -ForegroundColor Green
Write-Host ""

# Repository setup
$defaultRepo = "smartreview-ai-$(Get-Random -Maximum 9999)"
$repoName = Read-Host "Enter repository name (default: $defaultRepo)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = $defaultRepo
}

Write-Host ""
Write-Host "[1] Creating GitHub Repository..." -ForegroundColor Yellow
$createResult = gh repo create $repoName `
    --public `
    --clone=false `
    --description "AI-powered review generation system with SEO optimization" `
    --homepage "https://$ghUser.github.io/$repoName" `
    2>&1

if ($LASTEXITCODE -ne 0 -and $createResult -notmatch "already exists") {
    Write-Host "Error creating repository: $createResult" -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') { exit 1 }
}

Write-Host "Repository: https://github.com/$ghUser/$repoName" -ForegroundColor Green

# Git initialization and push
Write-Host ""
Write-Host "[2] Initializing Git..." -ForegroundColor Yellow

if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: SmartReview AI"
} else {
    git add .
    git commit -m "Update: Auto-deploy configuration" 2>$null
}

# Configure remote
git remote remove origin 2>$null
git remote add origin "https://github.com/$ghUser/$repoName.git"
git branch -M main

Write-Host ""
Write-Host "[3] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main --force

# Create .devcontainer for Codespaces
Write-Host ""
Write-Host "[4] Configuring GitHub Codespaces..." -ForegroundColor Yellow

$devcontainerPath = ".devcontainer"
if (-not (Test-Path $devcontainerPath)) {
    New-Item -ItemType Directory -Path $devcontainerPath | Out-Null
}

$devcontainerConfig = @{
    name = "SmartReview AI"
    image = "mcr.microsoft.com/devcontainers/python:3.11-node"
    features = @{
        "ghcr.io/devcontainers/features/node:1" = @{
            version = "18"
        }
    }
    postCreateCommand = "cd backend && pip install -r requirements.txt && cd ../frontend && npm install"
    postStartCommand = "bash start.sh"
    forwardPorts = @(3000, 8000)
    portsAttributes = @{
        "3000" = @{
            label = "Frontend"
            onAutoForward = "openBrowser"
        }
        "8000" = @{
            label = "Backend API"
            onAutoForward = "notify"
        }
    }
    customizations = @{
        vscode = @{
            extensions = @(
                "ms-python.python",
                "dbaeumer.vscode-eslint",
                "esbenp.prettier-vscode",
                "bradlc.vscode-tailwindcss"
            )
            settings = @{
                "terminal.integrated.defaultProfile.linux" = "bash"
                "python.linting.enabled" = $true
                "python.formatting.provider" = "black"
            }
        }
    }
} | ConvertTo-Json -Depth 10

$devcontainerConfig | Out-File -FilePath "$devcontainerPath/devcontainer.json" -Encoding UTF8

git add .devcontainer
git commit -m "Add Codespaces configuration"
git push

# Setup secrets
Write-Host ""
Write-Host "[5] Setting up GitHub Secrets..." -ForegroundColor Yellow

$openaiKey = Read-Host "Enter OpenAI API Key (press Enter to skip)" -AsSecureString
if ($openaiKey.Length -gt 0) {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey)
    $plainKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $plainKey | gh secret set OPENAI_API_KEY --repo="$ghUser/$repoName"
    Write-Host "Secret added: OPENAI_API_KEY" -ForegroundColor Green
}

# Create GitHub Actions workflow
Write-Host ""
Write-Host "[6] Setting up GitHub Actions..." -ForegroundColor Yellow

$workflowPath = ".github/workflows"
if (-not (Test-Path $workflowPath)) {
    New-Item -ItemType Directory -Path $workflowPath -Force | Out-Null
}

# Auto-deploy workflow
$deployWorkflow = @"
name: Auto Deploy to Cloud

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: 'Deployment target'
        required: true
        default: 'codespace'
        type: choice
        options:
        - codespace
        - pages
        - all

jobs:
  deploy-codespace:
    if: github.event.inputs.deploy_target == 'codespace' || github.event.inputs.deploy_target == 'all' || github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Codespace
        run: |
          echo "Codespace will be automatically configured on first access"
          echo "URL: https://github.com/$ghUser/$repoName/codespaces"
  
  deploy-pages:
    if: github.event.inputs.deploy_target == 'pages' || github.event.inputs.deploy_target == 'all'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          mkdir -p ../public
          cp -r dist/* ../public/
      - uses: actions/configure-pages@v3
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./public
      - uses: actions/deploy-pages@v2
"@

$deployWorkflow | Out-File -FilePath "$workflowPath/deploy.yml" -Encoding UTF8

git add .github
git commit -m "Add GitHub Actions workflows"
git push

# Enable GitHub Pages
Write-Host ""
Write-Host "[7] Enabling GitHub Pages..." -ForegroundColor Yellow

try {
    gh api "repos/$ghUser/$repoName/pages" `
        --method POST `
        --field source.branch=gh-pages `
        --field source.path=/ `
        2>$null
    Write-Host "GitHub Pages enabled!" -ForegroundColor Green
} catch {
    Write-Host "GitHub Pages will be enabled after first deployment" -ForegroundColor Yellow
}

# Create quick launch script
Write-Host ""
Write-Host "[8] Creating Quick Launch Commands..." -ForegroundColor Yellow

$quickLaunch = @"
@echo off
echo SmartReview AI - Quick Launch
echo.
echo 1. Open in Codespaces
echo 2. Open in github.dev  
echo 3. Open Repository
echo 4. View Live Site
echo.
set /p choice=Select option: 

if "%choice%"=="1" gh codespace create --repo $ghUser/$repoName --branch main
if "%choice%"=="2" start https://github.dev/$ghUser/$repoName
if "%choice%"=="3" start https://github.com/$ghUser/$repoName
if "%choice%"=="4" start https://$ghUser.github.io/$repoName
"@

$quickLaunch | Out-File -FilePath "quick-launch.bat" -Encoding ASCII

# Final deployment options
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host "1. Create GitHub Codespace (Full cloud IDE)" -ForegroundColor White
Write-Host "2. Open in github.dev (Quick edit)" -ForegroundColor White
Write-Host "3. Import to Replit" -ForegroundColor White
Write-Host "4. Open in StackBlitz" -ForegroundColor White
Write-Host "5. Open in CodeSandbox" -ForegroundColor White
Write-Host "6. Trigger GitHub Actions Deploy" -ForegroundColor White
Write-Host "7. View all URLs" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "Creating Codespace..." -ForegroundColor Yellow
        $codespace = gh codespace create --repo "$ghUser/$repoName" --branch main --machine standardLinux32gb
        Start-Sleep -Seconds 3
        gh codespace code --repo "$ghUser/$repoName"
    }
    "2" {
        Start-Process "https://github.dev/$ghUser/$repoName"
    }
    "3" {
        Start-Process "https://replit.com/github/$ghUser/$repoName"
    }
    "4" {
        Start-Process "https://stackblitz.com/github/$ghUser/$repoName"
    }
    "5" {
        Start-Process "https://codesandbox.io/s/github/$ghUser/$repoName"
    }
    "6" {
        Write-Host "Triggering GitHub Actions..." -ForegroundColor Yellow
        gh workflow run deploy.yml --repo "$ghUser/$repoName" -f deploy_target=all
        Write-Host "Deployment started! Check: https://github.com/$ghUser/$repoName/actions" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository:" -ForegroundColor Cyan
Write-Host "  https://github.com/$ghUser/$repoName" -ForegroundColor White
Write-Host ""
Write-Host "Development Environments:" -ForegroundColor Cyan
Write-Host "  Codespaces: gh codespace create --repo $ghUser/$repoName" -ForegroundColor White
Write-Host "  github.dev: https://github.dev/$ghUser/$repoName" -ForegroundColor White
Write-Host "  Replit:     https://replit.com/github/$ghUser/$repoName" -ForegroundColor White
Write-Host "  StackBlitz: https://stackblitz.com/github/$ghUser/$repoName" -ForegroundColor White
Write-Host ""
Write-Host "Live Site (after deploy):" -ForegroundColor Cyan
Write-Host "  https://$ghUser.github.io/$repoName" -ForegroundColor White
Write-Host ""
Write-Host "Quick Launch: Run 'quick-launch.bat' anytime!" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"