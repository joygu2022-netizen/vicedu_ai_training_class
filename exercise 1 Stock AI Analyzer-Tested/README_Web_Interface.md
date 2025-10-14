# Stock AI Analyzer - Web Interface

A modern, responsive web interface for your stock analysis tool powered by AI.

## 🚀 Quick Start (Easiest Way)

### **Option 1: Double-Click to Run**
1. **Double-click `START_HERE.bat`** - This will give you a menu to choose how to run the application
2. **Choose option 1** for the easiest Windows experience
3. **The web interface will open automatically** in your browser at `http://localhost:5000`

### **Option 2: Direct Run Files**
- **Windows**: Double-click `run_web_interface.bat`
- **Cross-platform**: Run `python run_web_interface.py`
- **PowerShell**: Run `run_web_interface.ps1`

## Features

- **Stock Analysis**: Analyze multiple stocks with AI-powered buy/sell recommendations
- **Time Period Selection**: Choose from 1 day to maximum available data (up to 10+ years)
- **Interactive Charts**: Beautiful price trend visualization with Chart.js
- **Quick Lookup**: Get real-time price data for individual stocks
- **Interactive Chat**: Ask AI questions about stocks and market trends
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Data**: Fetches live stock data from Yahoo Finance

## Manual Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   Make sure you have your OpenAI API key set:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```
   Or on Windows:
   ```cmd
   set OPENAI_API_KEY=your-api-key-here
   ```

3. **Run the Application**:
   ```bash
   python app.py
   ```

4. **Access the Interface**:
   Open your browser and go to: `http://localhost:5000`

## How to Use

### Stock Analysis
1. **Select Time Period**: Choose from 1 day to maximum available data
2. Add stock symbols using the input field (default symbols: AAPL, TSLA, AMZN, NVDA, MSFT, HOOD)
3. Click "Analyze Stocks" to get AI-powered recommendations
4. View real-time prices and AI analysis results

### Quick Lookup & Charts
1. Enter a single stock symbol
2. **Select Chart Period**: Choose the time range for the chart (1 day to 10+ years)
3. Click "Get Price" for instant price data
4. Click "Show Chart" to visualize price trends with interactive charts

### AI Chat
1. Type questions about stocks or market trends
2. Get intelligent responses based on current market data

### Time Period Options
- **1 Day**: Intraday data
- **5 Days**: One week of trading
- **1 Month**: Recent month performance
- **3 Months**: Quarterly view
- **6 Months**: Half-year trend
- **1 Year**: Annual performance (default)
- **2 Years**: Two-year trend
- **5 Years**: Five-year performance
- **10 Years**: Decade-long view
- **Year to Date**: Current year performance
- **Max**: Maximum available historical data

## API Endpoints

- `GET /` - Main interface
- `GET /api/stock/<symbol>?period=<period>` - Get single stock data with time period
- `GET /api/stock/<symbol>/history?period=<period>` - Get historical data for charting
- `POST /api/analyze` - Analyze multiple stocks with time period support
- `POST /api/ask` - Ask AI questions

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js for interactive data visualization
- **Data Source**: Yahoo Finance (yfinance)
- **AI**: OpenAI GPT-4o-mini
- **Styling**: Custom CSS with modern design principles
- **Data Processing**: Pandas for historical data handling

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Run Files Available

### **START_HERE.bat** (Recommended)
- Interactive menu to choose how to run the application
- Handles all setup automatically
- Cross-platform options available

### **run_web_interface.bat** (Windows Batch)
- Simple Windows batch file
- Checks dependencies and API key
- Opens browser automatically

### **run_web_interface.py** (Python Script)
- Cross-platform Python launcher
- Comprehensive error checking
- Beautiful console output with emojis

### **run_web_interface.ps1** (PowerShell)
- Windows PowerShell script
- Advanced error handling
- Colored output for better readability

## Troubleshooting

- Make sure your OpenAI API key is set correctly
- Check your internet connection for stock data
- Ensure all dependencies are installed
- Check the console for any JavaScript errors
- If you get permission errors on Windows, try running as administrator
- For PowerShell scripts, you may need to set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

