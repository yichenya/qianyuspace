-- 创建qianyu数据库
CREATE DATABASE qianyu;

-- 连接到qianyu数据库后执行以下SQL

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
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建画布状态表
CREATE TABLE IF NOT EXISTS canvas_state (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
    state_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建素材表
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
);

-- 创建使用额度表
CREATE TABLE IF NOT EXISTS usage_quota (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    daily_quota INTEGER DEFAULT 0,
    used_today INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE
);

-- 创建生成日志表
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
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建素材收藏表
CREATE TABLE IF NOT EXISTS material_favorite (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES material(id) ON DELETE CASCADE,
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
('Newbie Badge', 'Complete first registration', '/badges/newbie.png'),
('Creator Badge', 'Generate first work', '/badges/creator.png'),
('Collector Badge', 'Favorite 10 materials', '/badges/collector.png'),
('Active Badge', 'Login for 7 consecutive days', '/badges/active.png'),
('VIP Badge', 'Upgrade to VIP user', '/badges/vip.png');
