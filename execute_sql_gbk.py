#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
执行SQL文件的脚本（使用GBK编码）
"""
import psycopg2
import os
import sys

# 设置环境变量
os.environ['PGCLIENTENCODING'] = 'UTF8'

print("正在执行SQL文件...")

# 读取SQL文件
try:
    with open('create_tables.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    print("SQL文件读取成功！")
except Exception as e:
    print(f"读取SQL文件时出错: {e}")
    sys.exit(1)

# 尝试连接数据库
try:
    # 使用GBK编码处理连接字符串
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="postgres123",
        port="5432"
    )
    print("成功连接到数据库！")
    
    # 创建游标
    cur = conn.cursor()
    
    # 检查qianyu数据库是否存在
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'qianyu'")
    exists = cur.fetchone()
    
    if not exists:
        print("创建qianyu数据库...")
        cur.execute("CREATE DATABASE qianyu")
        conn.commit()
        print("qianyu数据库创建成功！")
    else:
        print("qianyu数据库已存在！")
    
    # 关闭连接
    cur.close()
    conn.close()
    
    # 连接到qianyu数据库
    print("连接到qianyu数据库...")
    conn = psycopg2.connect(
        host="localhost",
        database="qianyu",
        user="postgres",
        password="postgres123",
        port="5432"
    )
    
    # 创建游标
    cur = conn.cursor()
    
    # 执行SQL脚本
    print("执行SQL脚本...")
    cur.execute(sql_script)
    
    # 提交事务
    conn.commit()
    print("SQL脚本执行成功！")
    
    # 关闭连接
    cur.close()
    conn.close()
    
    print("数据库表创建完成！")
    
except Exception as e:
    print(f"执行SQL时出错: {e}")
    import traceback
    traceback.print_exc()
    if 'conn' in locals():
        conn.rollback()
        conn.close()
