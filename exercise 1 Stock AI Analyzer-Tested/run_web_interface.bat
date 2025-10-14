@echo off
echo ========================================
echo    Stock AI Analyzer - Web Interface
echo ========================================
echo.
echo Starting the web application...
echo.
echo The interface will be available at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import flask, yfinance, openai" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if OpenAI API key is set
python -c "import os; exit(0 if os.getenv('OPENAI_API_KEY') else 1)" >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: OPENAI_API_KEY environment variable is not set
    echo The AI features will not work without this key
    echo.
    echo To set it, run:
    echo set OPENAI_API_KEY=your-api-key-here
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

REM Start the Flask application
echo Starting Flask application...
echo.
python app.py

REM If we get here, the application has stopped
echo.
echo Application stopped.
pause


