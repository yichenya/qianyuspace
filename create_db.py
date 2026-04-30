#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PostgreSQL数据库创建脚本
"""
import psycopg2

print("Testing PostgreSQL connection...")

try:
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="yang123",
        password="yang123",
        port="5432",
        connect_timeout=5
    )
    print("Connected to PostgreSQL!")

    cur = conn.cursor()

    cur.execute("SELECT version()")
    version = cur.fetchone()
    print("PostgreSQL version: " + str(version[0]))

    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'qianyu'")
    exists = cur.fetchone()

    if not exists:
        print("Creating qianyu database...")
        cur.execute("CREATE DATABASE qianyu")
        conn.commit()
        print("qianyu database created!")
    else:
        print("qianyu database already exists!")

    cur.close()
    conn.close()

    print("Connecting to qianyu database...")
    conn = psycopg2.connect(
        host="localhost",
        database="qianyu",
        user="yang123",
        password="yang123",
        port="5432",
        connect_timeout=5
    )
    print("Connected to qianyu!")

    cur = conn.cursor()

    print("Creating user table...")
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
    print("User table created!")

    print("Creating project table...")
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
    print("Project table created!")

    print("Creating canvas_state table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS canvas_state (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
        state_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("Canvas_state table created!")

    print("Creating material table...")
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
    print("Material table created!")

    print("Creating usage_quota table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS usage_quota (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        daily_quota INTEGER DEFAULT 0,
        used_today INTEGER DEFAULT 0,
        last_reset DATE DEFAULT CURRENT_DATE
    )
    """)
    print("Usage_quota table created!")

    print("Creating generation_log table...")
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
    print("Generation_log table created!")

    print("Creating badge table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS badge (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(255)
    )
    """)
    print("Badge table created!")

    print("Creating user_badge table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_badge (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("User_badge table created!")

    print("Creating material_favorite table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS material_favorite (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        material_id INTEGER REFERENCES material(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("Material_favorite table created!")

    print("Creating indexes...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status)")
    print("Indexes created!")

    print("Inserting default badges...")
    cur.execute("""
    INSERT INTO badge (name, description, icon) VALUES
    ('Newbie Badge', 'Complete first registration', '/badges/newbie.png'),
    ('Creator Badge', 'Generate first work', '/badges/creator.png'),
    ('Collector Badge', 'Favorite 10 materials', '/badges/collector.png'),
    ('Active Badge', 'Login for 7 consecutive days', '/badges/active.png'),
    ('VIP Badge', 'Upgrade to VIP user', '/badges/vip.png')
    ON CONFLICT DO NOTHING
    """)
    print("Default badges inserted!")

    conn.commit()

    cur.close()
    conn.close()

    print("="*50)
    print("All database tables created successfully!")
    print("="*50)

except Exception as e:
    print("Error: " + str(e))
    import traceback
    traceback.print_exc()
