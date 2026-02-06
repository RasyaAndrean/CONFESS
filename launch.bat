@echo off
title Confess - Anonymous Messaging Platform
echo ========================================
echo    Confess - Anonymous Messaging App    
echo ========================================
echo.
echo Choose version to launch:
echo 1. Local Storage Version (Quick Start)
echo 2. Firebase Version (Cloud Features)
echo 3. Documentation
echo.
choice /c 123 /m "Enter your choice"

if errorlevel 3 goto docs
if errorlevel 2 goto firebase
if errorlevel 1 goto local

:local
echo.
echo Launching Local Storage Version...
start "" "src\confess.html"
echo Local version launched!
goto end

:firebase
echo.
echo Launching Firebase Version...
start "" "src\confess-firebase.html"
echo Firebase version launched!
goto end

:docs
echo.
echo Opening Documentation...
start "" "docs\README.md"
echo Documentation opened!
goto end

:end
echo.
echo Press any key to close this window...
pause >nul