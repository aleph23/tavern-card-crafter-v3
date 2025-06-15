
@echo off
chcp 65001 >nul
echo Starting Character Card Creator...
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
echo Starting development server...
echo The application will be available at http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause
