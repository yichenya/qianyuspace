
﻿# 千域空间本地运行说明

## 已完善内容

- 用户端前端：按 `DESIGN.md` 的 Apple 风格落地全局主题、首页视觉、登录/项目/画布/素材/个人中心链路。
- 管理端前端：接入真实后端接口，覆盖仪表盘、用户、项目、素材、生成任务、统计等页面。
- 后端：认证、项目、画布、素材、AI生成模拟、额度扣减、消费统计、管理端接口已打通。
- 数据库：提供非破坏式初始化脚本，会创建缺失表、默认徽章和默认管理员。

## 默认账号

- 管理端：`admin@qianyu-space.com` / `admin123`
- 用户端：可在用户端注册新账号；密码至少 8 位。

## 端口

- 后端 API：`http://127.0.0.1:8001`
- 用户端：`http://127.0.0.1:5173`
- 管理端：`http://127.0.0.1:5174`

## 首次运行

### 1. 准备 PostgreSQL

确保 PostgreSQL 正在运行，并存在：

- 数据库：`qianyu`
- 用户：`yang123`
- 密码：`yang123`

后端默认连接串在 `backend/.env`：

```env
DATABASE_URL=postgresql://yang123:yang123@localhost:5432/qianyu
```

### 2. 安装后端依赖并初始化数据库

```powershell
cd d:\trae_project\flower\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH='d:/trae_project/flower/backend'
python app/core/init_db.py
```

### 3. 启动后端

```powershell
cd d:\trae_project\flower\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

验证：打开 `http://127.0.0.1:8001/health`，应返回：

```json
{"status":"healthy"}
```

### 4. 启动用户端

新开一个 PowerShell：

```powershell
cd d:\trae_project\flower\frontend
npm install
npm run dev
```

访问：`http://127.0.0.1:5173`

### 5. 启动管理端

再新开一个 PowerShell：

```powershell
cd d:\trae_project\flower\admin
npm install
npm run dev
```

访问：`http://127.0.0.1:5174`

## 一键启动

也可以在项目根目录执行：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\start_dev.ps1
```

## 常见问题

### 8001 端口打开不是千域空间API

说明 8001 被其他项目占用。先执行：

```powershell
Get-NetTCPConnection -LocalPort 8001 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

再重启后端。

### 注册/登录显示服务器错误

优先确认 `http://127.0.0.1:8001/openapi.json` 里的 `info.title` 是 `千域空间API`，不是其他项目。

### Redis 没启动

当前本地开发不强依赖 Redis。验证码接口会降级为控制台打印，不影响注册/登录主链路。
