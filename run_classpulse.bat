@echo off
title 🚀 ClassPulse Server
echo ============================================
echo       🚀 Launching ClassPulse Flask App
echo ============================================
echo.

REM OPTIONAL: Activate your virtual environment (uncomment next line if using one)
REM call venv\Scripts\activate

REM Set environment variables for Flask
set FLASK_APP=app.py
set FLASK_ENV=development

REM Run the Flask-SocketIO server
python app.py

echo.
echo ============================================
echo       🔥 ClassPulse Server Stopped
echo ============================================
pause
