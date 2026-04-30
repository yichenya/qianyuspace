$ErrorActionPreference = 'Stop'

Write-Host '启动千域空间开发环境...' -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$admin = Join-Path $root 'admin'

Write-Host '初始化数据库...' -ForegroundColor Cyan
$env:PYTHONPATH = $backend
python (Join-Path $backend 'app/core/init_db.py')

Write-Host '启动后端：http://127.0.0.1:8001' -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; if (Test-Path .venv/Scripts/Activate.ps1) { . .venv/Scripts/Activate.ps1 }; python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"


Write-Host '启动用户端：http://127.0.0.1:5173' -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm install; npm run dev"

Write-Host '启动管理端：http://127.0.0.1:5174' -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$admin'; npm install; npm run dev"

Write-Host '已打开三个终端。用户端 5173，管理端 5174，后端 8001。' -ForegroundColor Cyan
