@echo off
setlocal enabledelayedexpansion

echo Algorithm Visualizer - Quick Start Setup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Install dependencies
echo 📦 Installing Node.js dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    (
        echo PORT=3001
        echo MYSQL_HOST=localhost
        echo MYSQL_USER=root
        echo MYSQL_PASSWORD=your_password
        echo MYSQL_DATABASE=algorithm_visualizer
        echo MYSQL_PORT=3306
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created. Please edit it with your MySQL credentials.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🔧 Configuration
echo ================
echo.
echo Please update .env file with your MySQL credentials:
echo   - MYSQL_HOST: localhost
echo   - MYSQL_USER: root
echo   - MYSQL_PASSWORD: your_password
echo.
echo 🚀 Ready to Start!
echo ==================
echo.
echo 1. Ensure MySQL Server is running
echo 2. Update .env with your MySQL credentials
echo 3. Run: npm start (or npm run dev for development)
echo 4. Open: http://localhost:3001 in your browser
echo.
echo For detailed setup instructions, see SETUP_GUIDE.md
echo.
pause
