@echo off
set "ROOT=%~dp0"

echo ===================================
echo   Tomato LeafGuard - Start Server
echo ===================================
echo.

echo [1/2] Starting Backend (FastAPI port 8000)...
start "Backend - Tomato LeafGuard" /D "%ROOT%backend" cmd /k "venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"

echo [2/2] Starting Frontend (Vite port 5173)...
start "Frontend - Tomato LeafGuard" /D "%ROOT%frontend" cmd /k "npm run dev"

echo.
echo ===================================
echo  Backend  : http://localhost:8000
echo  API Docs : http://localhost:8000/docs
echo  Frontend : http://localhost:5173
echo ===================================

timeout /t 3
start http://localhost:5173
