@echo off
title Stock AI Analyzer - Quick Start
color 0A

echo.
echo  ███████╗████████╗ █████╗ ██████╗ ████████╗    █████╗ ██╗
echo  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝   ██╔══██╗██║
echo  ███████╗   ██║   ███████║██████╔╝   ██║      ███████║██║
echo  ╚════██║   ██║   ██╔══██║██╔══██╗   ██║      ██╔══██║██║
echo  ███████║   ██║   ██║  ██║██║  ██║   ██║      ██║  ██║██║
echo  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝  ╚═╝╚═╝
echo.
echo  █████╗ ██╗    ███╗   ██╗ █████╗ ██╗   ██╗ █████╗ ██╗   ██╗███████╗██████╗ 
echo ██╔══██╗██║    ████╗  ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║   ██║██╔════╝██╔══██╗
echo ███████║██║    ██╔██╗ ██║███████║ ╚████╔╝ ███████║██║   ██║█████╗  ██████╔╝
echo ██╔══██║██║    ██║╚██╗██║██╔══██║  ╚██╔╝  ██╔══██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
echo ██║  ██║██║    ██║ ╚████║██║  ██║   ██║   ██║  ██║ ╚████╔╝ ███████╗██║  ██║
echo ╚═╝  ╚═╝╚═╝    ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
echo.
echo ========================================
echo    Stock AI Analyzer - Web Interface
echo ========================================
echo.
echo Choose how to start the application:
echo.
echo [1] Run with Batch File (Recommended for Windows)
echo [2] Run with Python Script (Cross-platform)
echo [3] Run with PowerShell (Windows PowerShell)
echo [4] View README and Instructions
echo [5] Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting with Batch File...
    call run_web_interface.bat
) else if "%choice%"=="2" (
    echo.
    echo Starting with Python Script...
    python run_web_interface.py
) else if "%choice%"=="3" (
    echo.
    echo Starting with PowerShell...
    powershell -ExecutionPolicy Bypass -File run_web_interface.ps1
) else if "%choice%"=="4" (
    echo.
    echo Opening README...
    if exist README_Web_Interface.md (
        start README_Web_Interface.md
    ) else (
        echo README file not found. Here are the basic instructions:
        echo.
        echo 1. Make sure Python is installed
        echo 2. Set your OpenAI API key: set OPENAI_API_KEY=your-key-here
        echo 3. Run: python app.py
        echo 4. Open browser to: http://localhost:5000
    )
    pause
    goto :start
) else if "%choice%"=="5" (
    echo.
    echo Goodbye!
    exit /b 0
) else (
    echo.
    echo Invalid choice. Please try again.
    pause
    goto :start
)

:start
echo.
echo Press any key to return to menu...
pause >nul
cls
goto :eof


