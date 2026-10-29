@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Open a new terminal after installing Node.js.
  pause
  exit /b 1
)
node student/daily-server.mjs
pause
