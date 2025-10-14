from flask import Flask, render_template, request, jsonify
import yfinance as yf
import os
import openai
import json
import pandas as pd
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Company name to stock symbol mapping
COMPANY_SYMBOL_MAP = {
    # Chinese companies
    "苹果": "AAPL", "apple": "AAPL", "苹果公司": "AAPL",
    "特斯拉": "TSLA", "tesla": "TSLA", "特斯拉公司": "TSLA",
    "微软": "MSFT", "microsoft": "MSFT", "微软公司": "MSFT",
    "亚马逊": "AMZN", "amazon": "AMZN", "亚马逊公司": "AMZN",
    "谷歌": "GOOGL", "google": "GOOGL", "谷歌公司": "GOOGL", "alphabet": "GOOGL",
    "英伟达": "NVDA", "nvidia": "NVDA", "英伟达公司": "NVDA",
    "meta": "META", "facebook": "META", "脸书": "META", "meta公司": "META",
    "比亚迪": "BYDDF", "byd": "BYDDF", "比亚迪公司": "BYDDF",
    "腾讯": "TCEHY", "tencent": "TCEHY", "腾讯公司": "TCEHY",
    "阿里巴巴": "BABA", "alibaba": "BABA", "阿里": "BABA",
    "美团": "MPNGF", "meituan": "MPNGF", "美团公司": "MPNGF",
    "京东": "JD", "jingdong": "JD", "京东公司": "JD",
    "百度": "BIDU", "baidu": "BIDU", "百度公司": "BIDU",
    "网易": "NTES", "netease": "NTES", "网易公司": "NTES",
    "拼多多": "PDD", "pinduoduo": "PDD", "拼多多公司": "PDD",
    "小米": "XIACF", "xiaomi": "XIACF", "小米公司": "XIACF",
    "华为": "HWTFF", "huawei": "HWTFF", "华为公司": "HWTFF",
    "茅台": "600519.SS", "maotai": "600519.SS", "贵州茅台": "600519.SS",
    "工商银行": "601398.SS", "icbc": "601398.SS", "工行": "601398.SS",
    "建设银行": "601939.SS", "ccb": "601939.SS", "建行": "601939.SS",
    "中国平安": "601318.SS", "pingan": "601318.SS", "平安": "601318.SS",
    "招商银行": "600036.SS", "cmb": "600036.SS", "招行": "600036.SS",
    "中国移动": "600941.SS", "chinamobile": "600941.SS", "移动": "600941.SS",
    "中国石油": "601857.SS", "petrochina": "601857.SS", "中石油": "601857.SS",
    "中国石化": "600028.SS", "sinopec": "600028.SS", "中石化": "600028.SS",
    "中国银行": "601988.SS", "boc": "601988.SS", "中行": "601988.SS",
    "农业银行": "601288.SS", "abc": "601288.SS", "农行": "601288.SS",
    "交通银行": "601328.SS", "bocom": "601328.SS", "交行": "601328.SS",
    "兴业银行": "601166.SS", "cib": "601166.SS", "兴业": "601166.SS",
    "浦发银行": "600000.SS", "spdb": "600000.SS", "浦发": "600000.SS",
    "民生银行": "600016.SS", "cmbc": "600016.SS", "民生": "600016.SS",
    "光大银行": "601818.SS", "ceb": "601818.SS", "光大": "601818.SS",
    "华夏银行": "600015.SS", "hxb": "600015.SS", "华夏": "600015.SS",
    "中信银行": "601998.SS", "citic": "601998.SS", "中信": "601998.SS",
    "平安银行": "000001.SZ", "pab": "000001.SZ", "平安银行": "000001.SZ",
    "万科": "000002.SZ", "vanke": "000002.SZ", "万科公司": "000002.SZ",
    "格力": "000651.SZ", "gree": "000651.SZ", "格力电器": "000651.SZ",
    "美的": "000333.SZ", "midea": "000333.SZ", "美的集团": "000333.SZ",
    "海尔": "600690.SS", "haier": "600690.SS", "海尔智家": "600690.SS",
    "五粮液": "000858.SZ", "wuliangye": "000858.SZ", "五粮液公司": "000858.SZ",
    "泸州老窖": "000568.SZ", "luzhou": "000568.SZ", "泸州老窖公司": "000568.SZ",
    "洋河": "002304.SZ", "yanghe": "002304.SZ", "洋河股份": "002304.SZ",
    "海天": "603288.SS", "haitian": "603288.SS", "海天味业": "603288.SS",
    "伊利": "600887.SS", "yili": "600887.SS", "伊利股份": "600887.SS",
    "蒙牛": "2319.HK", "mengniu": "2319.HK", "蒙牛乳业": "2319.HK",
    "中芯国际": "688981.SS", "smic": "688981.SS", "中芯": "688981.SS",
    "台积电": "TSM", "tsmc": "TSM", "台积电公司": "TSM",
    "三星": "005930.KS", "samsung": "005930.KS", "三星电子": "005930.KS",
    "索尼": "SONY", "sony": "SONY", "索尼公司": "SONY",
    "任天堂": "NTDOY", "nintendo": "NTDOY", "任天堂公司": "NTDOY",
    "丰田": "TM", "toyota": "TM", "丰田汽车": "TM",
    "本田": "HMC", "honda": "HMC", "本田汽车": "HMC",
    "大众": "VWAGY", "volkswagen": "VWAGY", "大众汽车": "VWAGY",
    "奔驰": "DMLRY", "mercedes": "DMLRY", "奔驰公司": "DMLRY",
    "宝马": "BMWYY", "bmw": "BMWYY", "宝马公司": "BMWYY",
    "奥迪": "AUDVF", "audi": "AUDVF", "奥迪公司": "AUDVF",
    "保时捷": "POAHY", "porsche": "POAHY", "保时捷公司": "POAHY",
    "法拉利": "RACE", "ferrari": "RACE", "法拉利公司": "RACE",
    "通用": "GM", "general motors": "GM", "通用汽车": "GM",
    "福特": "F", "ford": "F", "福特汽车": "F",
    "雪佛兰": "GM", "chevrolet": "GM", "雪佛兰公司": "GM",
    "凯迪拉克": "GM", "cadillac": "GM", "凯迪拉克公司": "GM",
    "林肯": "F", "lincoln": "F", "林肯公司": "F",
    "克莱斯勒": "FCAU", "chrysler": "FCAU", "克莱斯勒公司": "FCAU",
    "吉普": "FCAU", "jeep": "FCAU", "吉普公司": "FCAU",
    "道奇": "FCAU", "dodge": "FCAU", "道奇公司": "FCAU",
    "拉姆": "FCAU", "ram": "FCAU", "拉姆公司": "FCAU",
    "玛莎拉蒂": "FCAU", "maserati": "FCAU", "玛莎拉蒂公司": "FCAU",
    "阿尔法罗密欧": "FCAU", "alfa romeo": "FCAU", "阿尔法罗密欧公司": "FCAU",
    "菲亚特": "FCAU", "fiat": "FCAU", "菲亚特公司": "FCAU",
    "标致": "PEUGF", "peugeot": "PEUGF", "标致公司": "PEUGF",
    "雪铁龙": "PEUGF", "citroen": "PEUGF", "雪铁龙公司": "PEUGF",
    "雷诺": "RNLSY", "renault": "RNLSY", "雷诺公司": "RNLSY",
    "日产": "NSANY", "nissan": "NSANY", "日产汽车": "NSANY",
    "英菲尼迪": "NSANY", "infiniti": "NSANY", "英菲尼迪公司": "NSANY",
    "讴歌": "HMC", "acura": "HMC", "讴歌公司": "HMC",
    "雷克萨斯": "TM", "lexus": "TM", "雷克萨斯公司": "TM",
    "现代": "HYMTF", "hyundai": "HYMTF", "现代汽车": "HYMTF",
    "起亚": "HYMTF", "kia": "HYMTF", "起亚汽车": "HYMTF",
    "捷豹": "TTM", "jaguar": "TTM", "捷豹公司": "TTM",
    "路虎": "TTM", "land rover": "TTM", "路虎公司": "TTM",
    "沃尔沃": "VLVLY", "volvo": "VLVLY", "沃尔沃公司": "VLVLY",
    "萨博": "VLVLY", "saab": "VLVLY", "萨博公司": "VLVLY",
    "斯柯达": "VWAGY", "skoda": "VWAGY", "斯柯达公司": "VWAGY",
    "西雅特": "VWAGY", "seat": "VWAGY", "西雅特公司": "VWAGY",
    "布加迪": "VWAGY", "bugatti": "VWAGY", "布加迪公司": "VWAGY",
    "兰博基尼": "VWAGY", "lamborghini": "VWAGY", "兰博基尼公司": "VWAGY",
    "宾利": "VWAGY", "bentley": "VWAGY", "宾利公司": "VWAGY",
    "劳斯莱斯": "BMWYY", "rolls royce": "BMWYY", "劳斯莱斯公司": "BMWYY",
    "迈凯伦": "MCLNF", "mclaren": "MCLNF", "迈凯伦公司": "MCLNF",
    "阿斯顿马丁": "ARGGY", "aston martin": "ARGGY", "阿斯顿马丁公司": "ARGGY",
    "莲花": "ARGGY", "lotus": "ARGGY", "莲花公司": "ARGGY",
    "卡特汉姆": "ARGGY", "caterham": "ARGGY", "卡特汉姆公司": "ARGGY",
    "摩根": "ARGGY", "morgan": "ARGGY", "摩根公司": "ARGGY",
    "路特斯": "ARGGY", "lotus": "ARGGY", "路特斯公司": "ARGGY",
    "迈巴赫": "DMLRY", "maybach": "DMLRY", "迈巴赫公司": "DMLRY",
    "smart": "DMLRY", "斯玛特": "DMLRY", "斯玛特公司": "DMLRY",
    "mini": "BMWYY", "迷你": "BMWYY", "迷你公司": "BMWYY",
    "劳斯莱斯": "BMWYY", "rolls royce": "BMWYY", "劳斯莱斯公司": "BMWYY",
    "宾利": "VWAGY", "bentley": "VWAGY", "宾利公司": "VWAGY",
    "兰博基尼": "VWAGY", "lamborghini": "VWAGY", "兰博基尼公司": "VWAGY",
    "布加迪": "VWAGY", "bugatti": "VWAGY", "布加迪公司": "VWAGY",
    "西雅特": "VWAGY", "seat": "VWAGY", "西雅特公司": "VWAGY",
    "斯柯达": "VWAGY", "skoda": "VWAGY", "斯柯达公司": "VWAGY",
    "萨博": "VLVLY", "saab": "VLVLY", "萨博公司": "VLVLY",
    "沃尔沃": "VLVLY", "volvo": "VLVLY", "沃尔沃公司": "VLVLY",
    "路虎": "TTM", "land rover": "TTM", "路虎公司": "TTM",
    "捷豹": "TTM", "jaguar": "TTM", "捷豹公司": "TTM",
    "起亚": "HYMTF", "kia": "HYMTF", "起亚汽车": "HYMTF",
    "现代": "HYMTF", "hyundai": "HYMTF", "现代汽车": "HYMTF",
    "雷克萨斯": "TM", "lexus": "TM", "雷克萨斯公司": "TM",
    "讴歌": "HMC", "acura": "HMC", "讴歌公司": "HMC",
    "英菲尼迪": "NSANY", "infiniti": "NSANY", "英菲尼迪公司": "NSANY",
    "日产": "NSANY", "nissan": "NSANY", "日产汽车": "NSANY",
    "雷诺": "RNLSY", "renault": "RNLSY", "雷诺公司": "RNLSY",
    "雪铁龙": "PEUGF", "citroen": "PEUGF", "雪铁龙公司": "PEUGF",
    "标致": "PEUGF", "peugeot": "PEUGF", "标致公司": "PEUGF",
    "菲亚特": "FCAU", "fiat": "FCAU", "菲亚特公司": "FCAU",
    "阿尔法罗密欧": "FCAU", "alfa romeo": "FCAU", "阿尔法罗密欧公司": "FCAU",
    "玛莎拉蒂": "FCAU", "maserati": "FCAU", "玛莎拉蒂公司": "FCAU",
    "拉姆": "FCAU", "ram": "FCAU", "拉姆公司": "FCAU",
    "道奇": "FCAU", "dodge": "FCAU", "道奇公司": "FCAU",
    "吉普": "FCAU", "jeep": "FCAU", "吉普公司": "FCAU",
    "克莱斯勒": "FCAU", "chrysler": "FCAU", "克莱斯勒公司": "FCAU",
    "林肯": "F", "lincoln": "F", "林肯公司": "F",
    "凯迪拉克": "GM", "cadillac": "GM", "凯迪拉克公司": "GM",
    "雪佛兰": "GM", "chevrolet": "GM", "雪佛兰公司": "GM",
    "福特": "F", "ford": "F", "福特汽车": "F",
    "通用": "GM", "general motors": "GM", "通用汽车": "GM",
    "法拉利": "RACE", "ferrari": "RACE", "法拉利公司": "RACE",
    "保时捷": "POAHY", "porsche": "POAHY", "保时捷公司": "POAHY",
    "奥迪": "AUDVF", "audi": "AUDVF", "奥迪公司": "AUDVF",
    "宝马": "BMWYY", "bmw": "BMWYY", "宝马公司": "BMWYY",
    "奔驰": "DMLRY", "mercedes": "DMLRY", "奔驰公司": "DMLRY",
    "大众": "VWAGY", "volkswagen": "VWAGY", "大众汽车": "VWAGY",
    "本田": "HMC", "honda": "HMC", "本田汽车": "HMC",
    "丰田": "TM", "toyota": "TM", "丰田汽车": "TM",
    "任天堂": "NTDOY", "nintendo": "NTDOY", "任天堂公司": "NTDOY",
    "索尼": "SONY", "sony": "SONY", "索尼公司": "SONY",
    "三星": "005930.KS", "samsung": "005930.KS", "三星电子": "005930.KS",
    "台积电": "TSM", "tsmc": "TSM", "台积电公司": "TSM",
    "中芯国际": "688981.SS", "smic": "688981.SS", "中芯": "688981.SS",
    "蒙牛": "2319.HK", "mengniu": "2319.HK", "蒙牛乳业": "2319.HK",
    "伊利": "600887.SS", "yili": "600887.SS", "伊利股份": "600887.SS",
    "海天": "603288.SS", "haitian": "603288.SS", "海天味业": "603288.SS",
    "洋河": "002304.SZ", "yanghe": "002304.SZ", "洋河股份": "002304.SZ",
    "泸州老窖": "000568.SZ", "luzhou": "000568.SZ", "泸州老窖公司": "000568.SZ",
    "五粮液": "000858.SZ", "wuliangye": "000858.SZ", "五粮液公司": "000858.SZ",
    "海尔": "600690.SS", "haier": "600690.SS", "海尔智家": "600690.SS",
    "美的": "000333.SZ", "midea": "000333.SZ", "美的集团": "000333.SZ",
    "格力": "000651.SZ", "gree": "000651.SZ", "格力电器": "000651.SZ",
    "万科": "000002.SZ", "vanke": "000002.SZ", "万科公司": "000002.SZ",
    "平安银行": "000001.SZ", "pab": "000001.SZ", "平安银行": "000001.SZ",
    "中信银行": "601998.SS", "citic": "601998.SS", "中信": "601998.SS",
    "华夏银行": "600015.SS", "hxb": "600015.SS", "华夏": "600015.SS",
    "光大银行": "601818.SS", "ceb": "601818.SS", "光大": "601818.SS",
    "民生银行": "600016.SS", "cmbc": "600016.SS", "民生": "600016.SS",
    "浦发银行": "600000.SS", "spdb": "600000.SS", "浦发": "600000.SS",
    "兴业银行": "601166.SS", "cib": "601166.SS", "兴业": "601166.SS",
    "交通银行": "601328.SS", "bocom": "601328.SS", "交行": "601328.SS",
    "农业银行": "601288.SS", "abc": "601288.SS", "农行": "601288.SS",
    "中国银行": "601988.SS", "boc": "601988.SS", "中行": "601988.SS",
    "中国石化": "600028.SS", "sinopec": "600028.SS", "中石化": "600028.SS",
    "中国石油": "601857.SS", "petrochina": "601857.SS", "中石油": "601857.SS",
    "中国移动": "600941.SS", "chinamobile": "600941.SS", "移动": "600941.SS",
    "招商银行": "600036.SS", "cmb": "600036.SS", "招行": "600036.SS",
    "中国平安": "601318.SS", "pingan": "601318.SS", "平安": "601318.SS",
    "建设银行": "601939.SS", "ccb": "601939.SS", "建行": "601939.SS",
    "工商银行": "601398.SS", "icbc": "601398.SS", "工行": "601398.SS",
    "茅台": "600519.SS", "maotai": "600519.SS", "贵州茅台": "600519.SS",
    "华为": "HWTFF", "huawei": "HWTFF", "华为公司": "HWTFF",
    "小米": "XIACF", "xiaomi": "XIACF", "小米公司": "XIACF",
    "拼多多": "PDD", "pinduoduo": "PDD", "拼多多公司": "PDD",
    "网易": "NTES", "netease": "NTES", "网易公司": "NTES",
    "百度": "BIDU", "baidu": "BIDU", "百度公司": "BIDU",
    "京东": "JD", "jingdong": "JD", "京东公司": "JD",
    "美团": "MPNGF", "meituan": "MPNGF", "美团公司": "MPNGF",
    "阿里巴巴": "BABA", "alibaba": "BABA", "阿里": "BABA",
    "腾讯": "TCEHY", "tencent": "TCEHY", "腾讯公司": "TCEHY",
    "比亚迪": "BYDDF", "byd": "BYDDF", "比亚迪公司": "BYDDF",
    "meta": "META", "facebook": "META", "脸书": "META", "meta公司": "META",
    "英伟达": "NVDA", "nvidia": "NVDA", "英伟达公司": "NVDA",
    "谷歌": "GOOGL", "google": "GOOGL", "谷歌公司": "GOOGL", "alphabet": "GOOGL",
    "亚马逊": "AMZN", "amazon": "AMZN", "亚马逊公司": "AMZN",
    "微软": "MSFT", "microsoft": "MSFT", "微软公司": "MSFT",
    "特斯拉": "TSLA", "tesla": "TSLA", "特斯拉公司": "TSLA",
    "苹果": "AAPL", "apple": "AAPL", "苹果公司": "AAPL",
}

def get_stock_symbol(input_text):
    """Convert company name or symbol to stock symbol"""
    input_text = input_text.strip().lower()
    
    # Direct symbol lookup
    if input_text.upper() in COMPANY_SYMBOL_MAP.values():
        return input_text.upper()
    
    # Company name lookup
    if input_text in COMPANY_SYMBOL_MAP:
        return COMPANY_SYMBOL_MAP[input_text]
    
    # Try to find partial matches
    for company, symbol in COMPANY_SYMBOL_MAP.items():
        if input_text in company.lower() or company.lower() in input_text:
            return symbol
    
    # If no match found, return the original input (might be a valid symbol)
    return input_text.upper()

def get_company_name_from_symbol(symbol):
    """Get company name from stock symbol"""
    for company, sym in COMPANY_SYMBOL_MAP.items():
        if sym == symbol.upper():
            return company
    return symbol

def fetch_stock_news(symbol, company_name=None):
    """Fetch recent news related to a stock"""
    try:
        print(f"Fetching news for {symbol}...")
        
        # Get company name if not provided
        if not company_name:
            company_name = get_company_name_from_symbol(symbol)
        
        # Use NewsAPI (free tier allows 100 requests per day)
        # You can get a free API key from https://newsapi.org/
        news_api_key = os.getenv("NEWS_API_KEY")
        
        if not news_api_key:
            # Fallback: return mock news data for demonstration
            return get_mock_news(symbol, company_name)
        
        # Calculate date range (last 7 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Search for news
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': f"{symbol} OR {company_name}",
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d'),
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 10,
            'apiKey': news_api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] == 'ok' and data['articles']:
            news_items = []
            for article in data['articles'][:5]:  # Limit to 5 articles
                news_items.append({
                    'title': article['title'],
                    'description': article['description'],
                    'url': article['url'],
                    'publishedAt': article['publishedAt'],
                    'source': article['source']['name']
                })
            return news_items
        else:
            return get_mock_news(symbol, company_name)
            
    except Exception as e:
        print(f"Error fetching news for {symbol}: {e}")
        return get_mock_news(symbol, company_name)

def get_mock_news(symbol, company_name):
    """Return mock news data for demonstration"""
    mock_news = {
        'AAPL': [
            {
                'title': f'Apple Inc. ({symbol}) Reports Strong Q4 Earnings',
                'description': 'Apple continues to show robust performance in the smartphone market with record iPhone sales.',
                'url': 'https://www.apple.com/newsroom/2024/01/apple-reports-first-quarter-results/',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Apple Newsroom'
            },
            {
                'title': f'{symbol} Stock Analysis: Bullish Outlook for 2024',
                'description': 'Analysts predict continued growth for Apple stock based on strong fundamentals.',
                'url': 'https://finance.yahoo.com/quote/AAPL',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            },
            {
                'title': f'Apple ({symbol}) Announces New Product Line',
                'description': 'The tech giant reveals innovative products that could drive future revenue growth.',
                'url': 'https://www.apple.com/',
                'publishedAt': (datetime.now() - timedelta(days=3)).isoformat(),
                'source': 'Apple Official'
            }
        ],
        'TSLA': [
            {
                'title': f'Tesla ({symbol}) Electric Vehicle Sales Surge',
                'description': 'Tesla reports record-breaking EV deliveries, beating market expectations.',
                'url': 'https://www.tesla.com/news',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Tesla News'
            },
            {
                'title': f'{symbol} Stock: Analysts Upgrade Price Target',
                'description': 'Multiple analysts raise Tesla price targets following strong quarterly results.',
                'url': 'https://finance.yahoo.com/quote/TSLA',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ],
        'MSFT': [
            {
                'title': f'Microsoft ({symbol}) Cloud Revenue Growth Continues',
                'description': 'Microsoft Azure and Office 365 drive strong quarterly performance.',
                'url': 'https://news.microsoft.com/',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Microsoft News'
            },
            {
                'title': f'{symbol} AI Investments Pay Off',
                'description': 'Microsoft\'s AI initiatives show promising results in latest earnings.',
                'url': 'https://finance.yahoo.com/quote/MSFT',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ],
        'GOOGL': [
            {
                'title': f'Google ({symbol}) Search Revenue Remains Strong',
                'description': 'Google continues to dominate search advertising market.',
                'url': 'https://blog.google/',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Google Blog'
            },
            {
                'title': f'{symbol} AI Developments Show Promise',
                'description': 'Google\'s AI research and development investments yield results.',
                'url': 'https://finance.yahoo.com/quote/GOOGL',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ],
        'AMZN': [
            {
                'title': f'Amazon ({symbol}) E-commerce Growth Accelerates',
                'description': 'Amazon reports strong growth in online retail and AWS services.',
                'url': 'https://www.aboutamazon.com/news',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Amazon News'
            },
            {
                'title': f'{symbol} AWS Cloud Services Lead Market',
                'description': 'Amazon Web Services continues to dominate cloud computing market.',
                'url': 'https://finance.yahoo.com/quote/AMZN',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ],
        'NVDA': [
            {
                'title': f'NVIDIA ({symbol}) AI Chip Demand Soars',
                'description': 'NVIDIA reports record demand for AI and gaming chips.',
                'url': 'https://nvidianews.nvidia.com/',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'NVIDIA News'
            },
            {
                'title': f'{symbol} Data Center Revenue Surges',
                'description': 'NVIDIA\'s data center business shows exceptional growth.',
                'url': 'https://finance.yahoo.com/quote/NVDA',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ]
    }
    
    # Return mock news for the symbol, or generic news if not found
    if symbol in mock_news:
        return mock_news[symbol]
    else:
        return [
            {
                'title': f'{company_name} ({symbol}) Market Update',
                'description': f'Latest developments and market analysis for {company_name} stock.',
                'url': f'https://finance.yahoo.com/quote/{symbol}',
                'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'Yahoo Finance'
            },
            {
                'title': f'{symbol} Stock Performance Review',
                'description': f'Comprehensive analysis of {company_name} stock performance and outlook.',
                'url': f'https://finance.yahoo.com/quote/{symbol}',
                'publishedAt': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'Yahoo Finance'
            }
        ]

def fetch_stock_price(symbol, period="1d"):
    """Fetch stock price data using Yahoo Finance"""
    try:
        print(f"Fetching data for {symbol} with period {period}...")
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
            
        # Get historical data for calculating change percentage
        # Use a longer period to ensure we have enough data for comparison
        hist = ticker.history(period="5d")  # Get 5 days to ensure we have previous day data
        print(f"Historical data length: {len(hist)}")
        print(f"Current price: {current_price}")
        
        if len(hist) >= 2:
            prev_close = hist['Close'].iloc[-2]  # Previous day's close
            change_percent = ((current_price - prev_close) / prev_close) * 100
            # Get the latest trading date
            latest_date = hist.index[-1].strftime("%Y-%m-%d")
            print(f"Previous close: {prev_close}, Change: {change_percent}%")
        else:
            # Fallback: try to get previous close from info
            prev_close = info.get('previousClose')
            print(f"Using info previousClose: {prev_close}")
            if prev_close and current_price:
                change_percent = ((current_price - prev_close) / prev_close) * 100
                print(f"Calculated change from info: {change_percent}%")
            else:
                change_percent = 0.0
                print("No previous close data available")
            latest_date = "N/A"
        
        # Check if it's weekend and adjust price/date accordingly
        from datetime import datetime, timedelta
        today = datetime.now()
        
        # If it's weekend (Saturday=5, Sunday=6), get Friday's data
        if today.weekday() >= 5:  # Weekend
            # Get last Friday's data
            friday_hist = ticker.history(period="5d")
            if len(friday_hist) >= 1:
                # Find the last Friday
                for i in range(len(friday_hist)-1, -1, -1):
                    if friday_hist.index[i].weekday() == 4:  # Friday
                        current_price = friday_hist['Close'].iloc[i]
                        latest_date = friday_hist.index[i].strftime("%Y-%m-%d")
                        # Calculate change from previous trading day
                        if i > 0:
                            prev_close = friday_hist['Close'].iloc[i-1]
                            change_percent = ((current_price - prev_close) / prev_close) * 100
                        else:
                            # If we can't find previous day in 5-day data, use info
                            prev_close = info.get('previousClose')
                            if prev_close:
                                change_percent = ((current_price - prev_close) / prev_close) * 100
                            else:
                                change_percent = 0.0
                        break
            
        return {
            "symbol": symbol,
            "price": round(float(current_price), 2),
            "change_percent": round(float(change_percent), 2),
            "date": latest_date
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def fetch_stock_history(symbol, period="1y"):
    """Fetch historical stock data for charting"""
    try:
        print(f"Fetching historical data for {symbol} with period {period}...")
        ticker = yf.Ticker(symbol)
        
        # Get historical data
        hist = ticker.history(period=period)
        
        if hist.empty:
            return None
            
        # Convert to list of dictionaries for JSON serialization
        data = []
        for date, row in hist.iterrows():
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else 0
            })
        
        return data
    except Exception as e:
        print(f"Error fetching historical data for {symbol}: {e}")
        return None

def analyze_with_llm(stocks):
    """Analyze stocks using OpenAI LLM"""
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

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/stock/<symbol>')
def get_stock(symbol):
    """Get single stock data"""
    period = request.args.get('period', '1d')
    # Convert company name to stock symbol
    actual_symbol = get_stock_symbol(symbol)
    data = fetch_stock_price(actual_symbol, period)
    if data:
        return jsonify({"success": True, "data": data})
    else:
        return jsonify({"success": False, "error": f"No data found for {symbol}"})

@app.route('/api/stock/<symbol>/history')
def get_stock_history(symbol):
    """Get historical stock data for charting"""
    period = request.args.get('period', '1y')
    # Convert company name to stock symbol
    actual_symbol = get_stock_symbol(symbol)
    data = fetch_stock_history(actual_symbol, period)
    if data:
        return jsonify({"success": True, "data": data})
    else:
        return jsonify({"success": False, "error": f"No historical data found for {symbol}"})

@app.route('/api/stock/<symbol>/news')
def get_stock_news(symbol):
    """Get recent news related to a stock"""
    # Convert company name to stock symbol
    actual_symbol = get_stock_symbol(symbol)
    company_name = get_company_name_from_symbol(actual_symbol)
    
    news_data = fetch_stock_news(actual_symbol, company_name)
    if news_data:
        return jsonify({"success": True, "data": news_data})
    else:
        return jsonify({"success": False, "error": f"No news found for {symbol}"})

@app.route('/api/analyze', methods=['POST'])
def analyze_stocks():
    """Analyze multiple stocks"""
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        period = data.get('period', '1d')
        
        if not symbols:
            return jsonify({"success": False, "error": "No symbols provided"})
        
        # Fetch stock data
        stock_data = []
        for symbol in symbols:
            # Convert company name to stock symbol
            actual_symbol = get_stock_symbol(symbol)
            data = fetch_stock_price(actual_symbol, period)
            if data:
                stock_data.append(data)
        
        if not stock_data:
            return jsonify({"success": False, "error": "No valid stock data found"})
        
        # Analyze with LLM
        analysis = analyze_with_llm(stock_data)
        
        return jsonify({
            "success": True,
            "stock_data": stock_data,
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Ask AI a question about stocks"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        symbols = data.get('symbols', [])
        
        if not question:
            return jsonify({"success": False, "error": "No question provided"})
        
        # Get current data for context
        stock_data = []
        for symbol in symbols[:5]:  # Limit to 5 for context
            data = fetch_stock_price(symbol.upper())
            if data:
                stock_data.append(data)
        
        # Create context for the question
        if stock_data:
            context = "\n".join([f"{s['symbol']}: ${s['price']} ({s['change_percent']:+.2f}%) - {s['date']}" for s in stock_data])
            prompt = f"Stock context:\n{context}\n\nQuestion: {question}"
        else:
            prompt = f"Question: {question}"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return jsonify({
            "success": True,
            "answer": response.choices[0].message.content
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)



