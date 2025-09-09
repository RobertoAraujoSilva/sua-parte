@echo off
echo 🔧 Limpando portas em uso...

echo Verificando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 3000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo Verificando porta 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 5173...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo Verificando porta 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 8080...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo Verificando porta 8787...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8787') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 8787...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo ✅ Portas limpas!
timeout /t 2 >nul
