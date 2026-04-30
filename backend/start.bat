@echo off
:: 启动FastAPI应用
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
