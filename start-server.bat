@echo off
title QueueLess Multi-Device Java Server (Android, Mac, Windows, iOS)
echo ==================================================================
echo   Starting QueueLess Server via Java 26 Runtime...
echo ==================================================================

:: 1. Prioritize Java (Installed & Fully Verified)
where java >nul 2>nul
if %ERRORLEVEL% equ 0 (
    cd /d "%~dp0"
    java QueueLessServer
    pause
    exit
)

:: 2. Try Python if installed
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python "%~dp0start-server.py"
    pause
    exit
)

:: 3. Fallback: Launch directly in default browser
echo Java or Python not detected. Opening QueueLess directly in your browser...
start "" "%~dp0index.html"
pause
