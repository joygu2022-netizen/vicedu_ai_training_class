#!/usr/bin/env python3
"""
Stock AI Analyzer - Web Interface Launcher
This script provides an easy way to start the web interface with proper setup and error handling.
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def print_banner():
    """Print a nice banner"""
    print("=" * 50)
    print("    Stock AI Analyzer - Web Interface")
    print("=" * 50)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ ERROR: Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check and install required dependencies"""
    required_packages = ['flask', 'yfinance', 'openai', 'pandas', 'requests']
    missing_packages = []
    
    print("🔍 Checking dependencies...")
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} - installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError:
            print("❌ ERROR: Failed to install dependencies")
            return False
    
    return True

def check_api_key():
    """Check if OpenAI API key is set"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("⚠️  WARNING: OPENAI_API_KEY environment variable is not set")
        print("   The AI features will not work without this key")
        print()
        print("   To set it:")
        print("   Windows: set OPENAI_API_KEY=your-api-key-here")
        print("   Linux/Mac: export OPENAI_API_KEY=your-api-key-here")
        print()
        
        response = input("Continue anyway? (y/n): ").lower().strip()
        if response not in ['y', 'yes']:
            return False
    else:
        print("✅ OpenAI API key is set")
    
    return True

def check_files():
    """Check if required files exist"""
    required_files = ['app.py', 'templates/index.html', 'requirements.txt']
    missing_files = []
    
    print("📁 Checking required files...")
    
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            missing_files.append(file_path)
            print(f"❌ {file_path} - missing")
    
    if missing_files:
        print(f"\n❌ ERROR: Missing required files: {', '.join(missing_files)}")
        return False
    
    return True

def start_web_server():
    """Start the Flask web server"""
    print("\n🚀 Starting web server...")
    print("   The interface will be available at: http://localhost:5000")
    print("   Press Ctrl+C to stop the server")
    print()
    print("=" * 50)
    
    # Open browser after a short delay
    def open_browser():
        time.sleep(2)
        try:
            webbrowser.open('http://localhost:5000')
            print("🌐 Opening browser...")
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print("   Please manually open: http://localhost:5000")
    
    # Start browser opening in a separate thread
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start the Flask application
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ ERROR: Failed to start server: {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: Unexpected error: {e}")
        return False
    
    return True

def main():
    """Main launcher function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        input("\nPress Enter to exit...")
        return 1
    
    # Check required files
    if not check_files():
        input("\nPress Enter to exit...")
        return 1
    
    # Check and install dependencies
    if not check_dependencies():
        input("\nPress Enter to exit...")
        return 1
    
    # Check API key
    if not check_api_key():
        print("👋 Goodbye!")
        return 0
    
    # Start the web server
    if start_web_server():
        print("\n👋 Goodbye!")
        return 0
    else:
        input("\nPress Enter to exit...")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        input("\nPress Enter to exit...")
        sys.exit(1)


