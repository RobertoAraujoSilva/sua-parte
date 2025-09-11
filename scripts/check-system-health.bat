@echo off
echo 🔍 Verificando Saúde do Sistema...
echo.
echo 🧪 Testando Backend (porta 3001)...
curl -f http://localhost:3001/api/status
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend: OK
) else (
    echo ❌ Backend: OFFLINE
)
echo.
echo 🧪 Testando Frontend (porta 8080)...
curl -f http://localhost:8080/
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend: OK
) else (
    echo ❌ Frontend: OFFLINE ou não iniciado
)
echo.
pause