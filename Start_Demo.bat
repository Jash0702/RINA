@echo off
title RINA Vision App Launcher
echo Starting RINA Vision App...
cd /d "%~dp0"
py -3 launch_demo.py
if errorlevel 1 (
    python launch_demo.py
)
pause
