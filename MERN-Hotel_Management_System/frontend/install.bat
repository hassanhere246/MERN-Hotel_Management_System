@echo off
echo Installing dependencies for Hotel Management System...
echo.
cd /d "%~dp0"
npm install
echo.
echo Installation complete!
echo.
echo To start the development server, run: npm run dev
pause
