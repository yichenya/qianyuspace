#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试数据库连接的脚本
"""
import psycopg2
import os

# 设置环境变量以避免编码问题
os.environ['PGCLIENTENCODING'] = 'UTF8'

print("正在测试数据库连接...")

# 尝试不同的连接参数
try:
    # 尝试使用postgres用户
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="postgres123",
        port="5432",
        options="-c client_encoding=utf8"
    )
    print("成功连接到postgres数据库！")
    
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
        port="5432",
        options="-c client_encoding=utf8"
    )
    
    # 创建游标
    cur = conn.cursor()
    
    # 创建基本表结构（不使用JSONB类型）
    print("创建基本表结构...")
    
    # 创建用户表
    cur.execute("""
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 创建项目表
    cur.execute("""
    CREATE TABLE IF NOT EXISTS project (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id),
        name VARCHAR(50) NOT NULL,
        cover_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 创建素材表
    cur.execute("""
    CREATE TABLE IF NOT EXISTS material (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id),
        type VARCHAR(20) NOT NULL,
        url VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        width INTEGER,
        height INTEGER,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 提交事务
    conn.commit()
    print("表结构创建成功！")
    
    # 关闭连接
    cur.close()
    conn.close()
    
    print("数据库初始化完成！")
    
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
