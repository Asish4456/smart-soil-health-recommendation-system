@echo off
echo ========================================
echo   Smart Soil Health Recommendation System
echo   Starting all services...
echo ========================================

echo.
echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB is NOT running. Please start MongoDB first.
    echo You can start it with: net start MongoDB
    pause
    exit /b 1
)
echo MongoDB is running.

echo.
echo [2/4] Starting Node.js Backend (port 5000)...
start "Soil Backend" cmd /k "cd /d %~dp0backend && node server.js"

echo.
echo [3/4] Starting Python Agri RAG API (port 8000)...
start "Agri RAG API" cmd /k "cd /d %~dp0agri_rag && pip install -r requirements.txt && python -m uvicorn agri_rag_api:app --host 0.0.0.0 --port 8000"

echo.
echo [4/4] Starting React Frontend (port 3000)...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   All services starting!
echo   Frontend:         http://localhost:3000
echo   Soil Backend:     http://localhost:5000
echo   Agri RAG API:     http://localhost:8000
echo ========================================
pause
