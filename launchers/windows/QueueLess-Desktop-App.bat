@echo off
title QueueLess Desktop App Launcher
echo Starting QueueLess as a Standalone Desktop Application...

set TARGET=%~dp0..\..\index.html

:: Try launching in Edge App Mode (Clean window without browser tabs)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    exit
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    exit
)

:: Try Google Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%TARGET%"
    exit
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="file:///%TARGET%"
    exit
)

:: Fallback to standard default browser
start "" "%TARGET%"
exit
