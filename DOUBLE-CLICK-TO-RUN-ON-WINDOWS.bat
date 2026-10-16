@echo off
title QueueLess — Launch Hospital App on Windows
color 0A
cls
echo ====================================================================
echo    [HOSPITAL] QueueLess Smart OPD Queue & Travel Dispatch App
echo ====================================================================
echo.
echo Launching QueueLess Application in clean native window...
echo.

set TARGET=%~dp0index.html

:: Check if server is running or start Java server in background
start /B java QueueLessServer >nul 2>&1

:: Open in Microsoft Edge Native App Mode (no address bar)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    goto finish
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    goto finish
)

:: Try Google Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%TARGET%"
    goto finish
)

:: Fallback Default Browser
start "" "%TARGET%"

:finish
echo QueueLess successfully launched!
exit
