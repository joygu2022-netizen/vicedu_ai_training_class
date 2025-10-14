import yfinance as yf
import os
import openai
import json

# Get your API keys first
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client (updated for newer API)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# 1. Fetch stock data using Yahoo Finance
def fetch_stock_price(symbol):
    try:
        print(f"Fetching data for {symbol}...")
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get current price
        current_price = info.get('currentPrice') or info.get('regularMarketPrice')
        if current_price is None:
            # Fallback to fast_info
            fast_info = ticker.fast_info
            current_price = getattr(fast_info, 'last_price', None)
        
        if current_price is None:
            print(f"No price data found for {symbol}")
            return None
            
        # Get previous close for change calculation and date
        hist = ticker.history(period="2d")
        if len(hist) >= 2:
            prev_close = hist['Close'].iloc[-2]
            change_percent = ((current_price - prev_close) / prev_close) * 100
            # Get the latest trading date
            latest_date = hist.index[-1].strftime("%Y-%m-%d")
        else:
            change_percent = 0.0
            latest_date = "N/A"
            
        return {
            "symbol": symbol,
            "price": round(float(current_price), 2),
            "change_percent": round(float(change_percent), 2),
            "date": latest_date
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

# 2. Screen stocks with LLM
def analyze_with_llm(stocks):
    stock_summary = "\n".join(
        [f"{s['symbol']}: Price={s['price']}, Change%={s['change_percent']}" for s in stocks]
    )
    prompt = f"""
    You are a stock screening assistant.
    Here is the stock data:

    {stock_summary}

    Task:
    - Decide if each stock goes into BUY or SELL list.
    - SELL list should be ordered by priority (biggest negative change first).
    - Give short reasons for each.
    Return result in JSON with keys: buy_list, sell_list.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content

# 3. Interactive CLI loop
def interactive_mode():
    tracked_symbols = ["AAPL", "TSLA", "AMZN", "NVDA", "MSFT", "HOOD"]
    
    def print_help():
        print("""
Commands:
  help                 Show this help
  list                 Show tracked symbols
  add SYMBOL [..]      Add one or more tickers
  remove SYMBOL [..]   Remove one or more tickers
  price SYMBOL         Get current price for one symbol
  screen [days]        Analyze all tracked stocks (default: current data)
  ask QUESTION         Ask any question about stocks
  exit                 Quit
        """)
    
    def get_stock_data(symbols):
        stock_data = []
        for sym in symbols:
            data = fetch_stock_price(sym)
            if data:
                stock_data.append(data)
        return stock_data
    
    print("Interactive Stock Screener")
    print("Type 'help' for commands. Type 'exit' to quit.")
    
    while True:
        try:
            command = input("\nagent> ").strip().lower()
            
            if command in ["exit", "quit", "q"]:
                print("Goodbye!")
                break
                
            elif command == "help":
                print_help()
                
            elif command == "list":
                print("Tracked symbols:", ", ".join(tracked_symbols))
                
            elif command.startswith("add "):
                new_symbols = command[4:].upper().split()
                for sym in new_symbols:
                    if sym not in tracked_symbols:
                        tracked_symbols.append(sym)
                print("Tracked symbols:", ", ".join(tracked_symbols))
                
            elif command.startswith("remove "):
                remove_symbols = command[7:].upper().split()
                for sym in remove_symbols:
                    if sym in tracked_symbols:
                        tracked_symbols.remove(sym)
                print("Tracked symbols:", ", ".join(tracked_symbols))
                
            elif command.startswith("price "):
                symbol = command[6:].upper().strip()
                if symbol:
                    data = fetch_stock_price(symbol)
                    if data:
                        print(f"{data['symbol']}: ${data['price']} ({data['change_percent']:+.2f}%) - {data['date']}")
                    else:
                        print(f"No data found for {symbol}")
                else:
                    print("Usage: price SYMBOL")
                    
            elif command.startswith("screen"):
                if not tracked_symbols:
                    print("No symbols tracked. Use 'add SYMBOL' to add stocks.")
                    continue
                    
                print("Fetching data for all tracked symbols...")
                stock_data = get_stock_data(tracked_symbols)
                
                if not stock_data:
                    print("No stock data available. Check your internet connection.")
                    continue
                    
                print("\nFetched Stock Data:")
                for s in stock_data:
                    print(f"{s['symbol']}: ${s['price']} ({s['change_percent']:+.2f}%) - {s['date']}")
                
                print("\nLLM Recommendation:")
                result = analyze_with_llm(stock_data)
                print(result)
                
            elif command.startswith("ask "):
                question = command[4:].strip()
                if not question:
                    print("Usage: ask QUESTION")
                    continue
                    
                # Get current data for context
                stock_data = get_stock_data(tracked_symbols[:5])  # Limit to 5 for context
                
                # Create context for the question
                if stock_data:
                    context = "\n".join([f"{s['symbol']}: ${s['price']} ({s['change_percent']:+.2f}%) - {s['date']}" for s in stock_data])
                    prompt = f"Stock context:\n{context}\n\nQuestion: {question}"
                else:
                    prompt = f"Question: {question}"
                
                try:
                    response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.3
                    )
                    print(response.choices[0].message.content)
                except Exception as e:
                    print(f"Error getting AI response: {e}")
                    
            elif command == "":
                continue
            else:
                print("Unknown command. Type 'help' for available commands.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

# 4. Simple mode (original functionality)
def simple_mode():
    symbols = ["AAPL", "TSLA", "AMZN", "NVDA", "MSFT", "HOOD"]
    stock_data = []
    for sym in symbols:
        data = fetch_stock_price(sym)
        if data:
            stock_data.append(data)

    print("Fetched Stock Data:")
    for s in stock_data:
        print(f"{s['symbol']}: ${s['price']} ({s['change_percent']:+.2f}%) - {s['date']}")

    print("\nLLM Recommendation:")
    result = analyze_with_llm(stock_data)
    print(result)

def main():
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_mode()
    else:
        simple_mode()

if __name__ == "__main__":
    main()