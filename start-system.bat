@echo off
echo 🚀 Iniciando Sistema Ministerial...

echo 🔧 Limpando portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8787') do taskkill /PID %%a /F >nul 2>&1

echo ✅ Portas limpas!
timeout /t 2 >nul

echo 🎯 Iniciando Backend (porta 8787)...
set PORT=8787
start "Backend" cmd /k "cd backend && set PORT=8787 && npm run dev"

timeout /t 3 >nul

echo 🌐 Iniciando Frontend (porta 5173)...
start "Frontend" cmd /k "npm run dev:frontend-only"

echo 🎉 Sistema iniciado!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:8787
echo 👑 Admin: http://localhost:5173/admin
pause
