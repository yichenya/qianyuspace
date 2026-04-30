@echo off

rem 初始化数据库表结构
echo 初始化数据库表结构...
python -m app.core.init_db

rem 初始化管理员用户
echo 初始化管理员用户...
python -m app.core.init_admin

rem 启动后端服务
echo 启动后端服务...
python main.py
