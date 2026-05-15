@echo off
title TACHE - Art Studio
echo.
echo  ============================================
echo       TACHE - Art Studio Platform
echo  ============================================
echo.

cd /d "%~dp0"

echo  [1/2] Installing dependencies...
call npm install
echo.

echo  [2/2] Starting development server...
echo.
echo  Opening http://localhost:3000 ...
start http://localhost:3000
call npm run dev

pause
