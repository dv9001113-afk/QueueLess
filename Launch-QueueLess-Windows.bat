@echo off
title Launch QueueLess
echo Launching QueueLess Application...

set TARGET=%~dp0index.html

:: Try launching in Edge App Mode (Clean standalone native window without browser tabs or address bar)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    exit
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="file:///%TARGET%"
    exit
)

:: Try Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%TARGET%"
    exit
)

:: Fallback
start "" "%TARGET%"
exit
