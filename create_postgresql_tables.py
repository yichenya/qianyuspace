#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用PostgreSQL创建数据库表的脚本
"""
import psycopg2
from psycopg2 import sql

print("正在连接PostgreSQL服务器...")

# 连接到PostgreSQL服务器（连接到默认的postgres数据库）
try:
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="yang123",
        password="yang123",
        port="5432"
    )
    print("成功连接到PostgreSQL服务器！")
except Exception as e:
    print(f"连接失败: {e}")
    exit(1)

# 创建游标
cur = conn.cursor()

# 检查qianyu数据库是否存在
print("检查qianyu数据库是否存在...")
cur.execute("SELECT 1 FROM pg_database WHERE datname = 'qianyu'")
exists = cur.fetchone()

if not exists:
    print("创建qianyu数据库...")
    cur.execute("CREATE DATABASE qianyu")
    conn.commit()
    print("qianyu数据库创建成功！")
else:
    print("qianyu数据库已存在！")

# 关闭到postgres数据库的连接
cur.close()
conn.close()

# 连接到qianyu数据库
print("连接到qianyu数据库...")
conn = psycopg2.connect(
    host="localhost",
    database="qianyu",
    user="yang123",
    password="yang123",
    port="5432"
)

# 创建游标
cur = conn.cursor()

# 创建表结构
print("开始创建数据库表...")

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
print("✓ 用户表创建成功")

# 创建项目表
cur.execute("""
CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✓ 项目表创建成功")

# 创建画布状态表
cur.execute("""
CREATE TABLE IF NOT EXISTS canvas_state (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
    state_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✓ 画布状态表创建成功")

# 创建素材表
cur.execute("""
CREATE TABLE IF NOT EXISTS material (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✓ 素材表创建成功")

# 创建使用额度表
cur.execute("""
CREATE TABLE IF NOT EXISTS usage_quota (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    daily_quota INTEGER DEFAULT 0,
    used_today INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE
)
""")
print("✓ 使用额度表创建成功")

# 创建生成日志表
cur.execute("""
CREATE TABLE IF NOT EXISTS generation_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
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
)
""")
print("✓ 生成日志表创建成功")

# 创建徽章表
cur.execute("""
CREATE TABLE IF NOT EXISTS badge (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(255)
)
""")
print("✓ 徽章表创建成功")

# 创建用户徽章关联表
cur.execute("""
CREATE TABLE IF NOT EXISTS user_badge (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✓ 用户徽章关联表创建成功")

# 创建素材收藏表
cur.execute("""
CREATE TABLE IF NOT EXISTS material_favorite (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES material(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✓ 素材收藏表创建成功")

# 创建索引
print("开始创建索引...")

cur.execute("CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email)")
print("✓ 用户邮箱索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at)")
print("✓ 项目用户ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id)")
print("✓ 画布状态项目ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at)")
print("✓ 素材用户ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at)")
print("✓ 生成日志用户ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status)")
print("✓ 生成日志状态索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_material_favorite_user_id ON material_favorite(user_id)")
print("✓ 素材收藏用户ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_material_favorite_material_id ON material_favorite(material_id)")
print("✓ 素材收藏素材ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_user_badge_user_id ON user_badge(user_id)")
print("✓ 用户徽章用户ID索引创建成功")

cur.execute("CREATE INDEX IF NOT EXISTS idx_user_badge_badge_id ON user_badge(badge_id)")
print("✓ 用户徽章徽章ID索引创建成功")

# 插入默认徽章数据
print("插入默认徽章数据...")
cur.execute("""
INSERT INTO badge (name, description, icon) VALUES
('新手徽章', '完成首次注册', '/badges/newbie.png'),
('创作者徽章', '生成第一个作品', '/badges/creator.png'),
('收藏家徽章', '收藏10个素材', '/badges/collector.png'),
('活跃用户徽章', '连续7天登录', '/badges/active.png'),
('VIP徽章', '升级为VIP用户', '/badges/vip.png')
ON CONFLICT DO NOTHING
""")
print("✓ 默认徽章数据插入成功")

# 提交事务
conn.commit()

# 关闭连接
cur.close()
conn.close()

print("\n" + "="*50)
print("🎉 所有数据库表创建成功！")
print("="*50)
print("\n已创建的表：")
print("  1. user - 用户表")
print("  2. project - 项目表")
print("  3. canvas_state - 画布状态表")
print("  4. material - 素材表")
print("  5. usage_quota - 使用额度表")
print("  6. generation_log - 生成日志表")
print("  7. badge - 徽章表")
print("  8. user_badge - 用户徽章关联表")
print("  9. material_favorite - 素材收藏表")
print("\n数据库初始化完成！")
