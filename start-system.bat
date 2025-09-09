@echo off
echo 🚀 Iniciando Sistema Ministerial...

echo 🔧 Limpando portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8787') do taskkill /PID %%a /F >nul 2>&1

echo ✅ Portas limpas!
timeout /t 2 >nul

echo 🎯 Iniciando Backend (porta 3000)...
set PORT=3000
start "Backend" cmd /k "cd backend && set PORT=3000 && npm run dev"

timeout /t 3 >nul

echo 🌐 Iniciando Frontend (porta 8080)...
start "Frontend" cmd /k "npm run dev:frontend-only"

echo 🎉 Sistema iniciado!
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend: http://localhost:3000
echo 👑 Admin: http://localhost:8080/admin
pause
