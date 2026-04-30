#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
直接创建数据库表的脚本
"""
import psycopg2

# 数据库连接信息
conn = psycopg2.connect(
    host="localhost",
    database="qianyu",
    user="admin",
    password="admin123",
    port="5432"
)

# 创建游标
cur = conn.cursor()

# 定义创建表的SQL语句
create_tables_sql = """
-- 创建用户表
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建项目表
CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    name VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建画布状态表
CREATE TABLE IF NOT EXISTS canvas_state (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(id),
    state_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建素材表
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
);

-- 创建使用额度表
CREATE TABLE IF NOT EXISTS usage_quota (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    daily_quota INTEGER DEFAULT 0,
    used_today INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE
);

-- 创建生成日志表
CREATE TABLE IF NOT EXISTS generation_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    type VARCHAR(20) NOT NULL,
    prompt TEXT NOT NULL,
    params JSONB,
    duration_seconds INTEGER,
    image_count INTEGER,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    charge_amount DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 创建徽章表
CREATE TABLE IF NOT EXISTS badge (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(255)
);

-- 创建用户徽章关联表
CREATE TABLE IF NOT EXISTS user_badge (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    badge_id INTEGER REFERENCES badge(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建素材收藏表
CREATE TABLE IF NOT EXISTS material_favorite (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    material_id INTEGER REFERENCES material(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id);
CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status);

-- 插入默认徽章数据
INSERT INTO badge (name, description, icon) VALUES
('新手徽章', '完成首次注册', 'https://example.com/badges/newbie.png'),
('创作者徽章', '生成第一个作品', 'https://example.com/badges/creator.png'),
('收藏家徽章', '收藏10个素材', 'https://example.com/badges/collector.png'),
('活跃用户徽章', '连续7天登录', 'https://example.com/badges/active.png')
ON CONFLICT (id) DO NOTHING;
"""

# 执行SQL语句
try:
    cur.execute(create_tables_sql)
    conn.commit()
    print("数据库表创建成功！")
except Exception as e:
    print(f"创建表时出错: {e}")
    conn.rollback()
finally:
    # 关闭游标和连接
    cur.close()
    conn.close()
