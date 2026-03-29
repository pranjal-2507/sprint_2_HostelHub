@echo off
setlocal enabledelayedexpansion

echo.
echo  =========================================
echo    HostelHub Development Environment
echo  =========================================
echo.

echo [+] Starting Backend (Rust/Axum)...
start "HostelHub Backend" cmd /k "cd backend && cargo run"

echo [+] Waiting for backend to initialize (5s)...
timeout /t 5 /nobreak > nul

echo [+] Starting Frontend (Angular)...
start "HostelHub Frontend" cmd /k "cd frontend && npm start"

echo.
echo  -----------------------------------------
echo   SERVICES STATUS:
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:4200
echo  -----------------------------------------
echo.
echo   LOGIN CREDENTIALS:
echo   Admin:    admin@gmail.com / @12345
echo   Student:  student1@gmail.com / password123
echo.
echo  =========================================
echo.
pause