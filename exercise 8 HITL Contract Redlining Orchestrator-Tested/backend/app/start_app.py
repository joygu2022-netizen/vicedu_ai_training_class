#!/usr/bin/env python3
"""
快速启动脚本 - Exercise 8: HITL Contract Redlining Orchestrator
"""

import subprocess
import sys
import os
import time
import requests

def check_dependencies():
    """检查必要的依赖是否已安装"""
    print("检查依赖包...")
    try:
        import fastapi
        import uvicorn
        import docx
        import reportlab
        print("所有依赖包已安装")
        return True
    except ImportError as e:
        print(f"缺少依赖包: {e}")
        print("请运行: pip install -r requirements.txt")
        return False

def start_application():
    """启动FastAPI应用程序"""
    print("\n启动多智能体法律文档审查系统...")
    
    try:
        # 启动应用程序
        subprocess.run([
            sys.executable, "-m", "app.main_with_framework"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"启动失败: {e}")
        return False
    except KeyboardInterrupt:
        print("\n应用程序已停止")
        return True

def test_application():
    """测试应用程序是否正常运行"""
    print("\n测试应用程序...")
    try:
        response = requests.get("http://localhost:8004/health", timeout=5)
        if response.status_code == 200:
            print("应用程序运行正常")
            print(f"   API文档: http://localhost:8004/docs")
            print(f"   健康检查: http://localhost:8004/health")
            return True
        else:
            print(f"应用程序响应异常: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("无法连接到应用程序")
        return False

def main():
    """主函数"""
    print("Exercise 8: HITL Contract Redlining Orchestrator")
    print("=" * 60)
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 启动应用程序
    print("\n按 Ctrl+C 停止应用程序")
    start_application()

if __name__ == "__main__":
    main()
