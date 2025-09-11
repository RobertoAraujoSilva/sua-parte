@echo off
echo 🚀 Iniciando Sistema Ministerial Backend...
echo.
cd backend
echo 📦 Verificando dependências...
npm install
echo.
echo 🌐 Iniciando servidor na porta 3001...
set PORT=3001
npm run dev
pause