
@echo off
chcp 65001 >nul
echo Starting Tavern Card Crafter Desktop App...
echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting desktop application...
echo The application will open in a new window
echo Press Ctrl+C to stop the application
echo.
call npm run electron-dev
pause
