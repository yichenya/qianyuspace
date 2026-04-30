#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单测试PostgreSQL连接的脚本
"""
import psycopg2

print("测试PostgreSQL连接...")

try:
    # 连接到PostgreSQL
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="yang123",
        password="yang123",
        port="5432",
        connect_timeout=5
    )
    print("✓ 成功连接到PostgreSQL！")

    # 创建游标
    cur = conn.cursor()

    # 测试查询
    cur.execute("SELECT version()")
    version = cur.fetchone()
    print(f"✓ PostgreSQL版本: {version[0]}")

    # 检查qianyu数据库
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'qianyu'")
    exists = cur.fetchone()

    if not exists:
        print("创建qianyu数据库...")
        cur.execute("CREATE DATABASE qianyu")
        conn.commit()
        print("✓ qianyu数据库创建成功！")
    else:
        print("✓ qianyu数据库已存在！")

    # 关闭连接
    cur.close()
    conn.close()

    # 连接到qianyu数据库
    print("\n连接到qianyu数据库...")
    conn = psycopg2.connect(
        host="localhost",
        database="qianyu",
        user="yang123",
        password="yang123",
        port="5432",
        connect_timeout=5
    )
    print("✓ 成功连接到qianyu数据库！")

    cur = conn.cursor()

    # 创建用户表
    print("\n创建用户表...")
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
    print("✓ 用户表创建成功！")

    # 创建项目表
    print("\n创建项目表...")
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
    print("✓ 项目表创建成功！")

    # 创建画布状态表
    print("\n创建画布状态表...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS canvas_state (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
        state_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("✓ 画布状态表创建成功！")

    # 创建素材表
    print("\n创建素材表...")
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
    print("✓ 素材表创建成功！")

    # 创建使用额度表
    print("\n创建使用额度表...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS usage_quota (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        daily_quota INTEGER DEFAULT 0,
        used_today INTEGER DEFAULT 0,
        last_reset DATE DEFAULT CURRENT_DATE
    )
    """)
    print("✓ 使用额度表创建成功！")

    # 创建生成日志表
    print("\n创建生成日志表...")
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
    print("✓ 生成日志表创建成功！")

    # 创建徽章表
    print("\n创建徽章表...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS badge (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(255)
    )
    """)
    print("✓ 徽章表创建成功！")

    # 创建用户徽章关联表
    print("\n创建用户徽章关联表...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_badge (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("✓ 用户徽章关联表创建成功！")

    # 创建素材收藏表
    print("\n创建素材收藏表...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS material_favorite (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        material_id INTEGER REFERENCES material(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("✓ 素材收藏表创建成功！")

    # 创建索引
    print("\n创建索引...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status)")
    print("✓ 索引创建成功！")

    # 插入默认徽章数据
    print("\n插入默认徽章数据...")
    cur.execute("""
    INSERT INTO badge (name, description, icon) VALUES
    ('新手徽章', '完成首次注册', '/badges/newbie.png'),
    ('创作者徽章', '生成第一个作品', '/badges/creator.png'),
    ('收藏家徽章', '收藏10个素材', '/badges/collector.png'),
    ('活跃用户徽章', '连续7天登录', '/badges/active.png'),
    ('VIP徽章', '升级为VIP用户', '/badges/vip.png')
    ON CONFLICT DO NOTHING
    """)
    print("✓ 默认徽章数据插入成功！")

    # 提交事务
    conn.commit()

    # 关闭连接
    cur.close()
    conn.close()

    print("\n" + "="*50)
    print("所有数据库表创建成功！")
    print("="*50)

except Exception as e:
    print(f"\n✗ 错误: {e}")
    import traceback
    traceback.print_exc()
