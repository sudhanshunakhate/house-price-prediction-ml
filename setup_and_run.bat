@echo off
echo ========================================================
echo   AI Smart House Price Project - Setup ^& Run Script
echo ========================================================
echo.

echo [1/3] Installing Backend Dependencies (Python/FastAPI)...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo [2/3] Installing Frontend Dependencies (Node.js/React)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo [3/3] Setup Complete! All dependencies are installed.
echo.
set /p RUN_NOW="Do you want to start the application servers now? (Y/N): "
if /i "%RUN_NOW%" neq "Y" goto end

echo Starting Backend Server on http://127.0.0.1:8000 ...
start cmd /k "title Backend Server && cd backend && uvicorn main:app --reload"

echo Starting Frontend Server on http://localhost:5173 ...
start cmd /k "title Frontend Server && cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate terminal windows!
echo Please wait a few seconds for them to start, then open your browser.
echo App URL: http://localhost:5173

:end
echo.
echo Press any key to exit...
pause >nul
