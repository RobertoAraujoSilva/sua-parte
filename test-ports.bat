@echo off
echo 🧪 Testando configuração de portas...

echo 🔧 Iniciando Backend (porta 3000)...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 5 >nul

echo 🌐 Iniciando Frontend (porta 8080)...
start "Frontend" cmd /k "npm run dev"

echo ✅ Serviços iniciados!
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend: http://localhost:3000
echo 👑 Admin: http://localhost:8080/admin
pause