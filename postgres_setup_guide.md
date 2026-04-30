# PostgreSQL 数据库表创建指南

## 步骤1：打开pgAdmin

1. 从开始菜单找到并打开 "pgAdmin 4"
2. 输入 pgAdmin 密码（安装时设置的密码）

## 步骤2：连接到服务器

1. 在左侧 "Servers" 上右键，选择 "Register" → "Server..."
2. 在 "General" 标签页：
   - Name: `PostgreSQL`
3. 在 "Connection" 标签页：
   - Host name/address: `localhost`
   - Port: `5432`
   - Username: `postgres`（或你设置的超级用户名）
   - Password: 输入你的PostgreSQL超级用户密码
   - 点击 "Save"

## 步骤3：创建数据库

1. 展开 "Servers" → "PostgreSQL" → "Databases"
2. 右键 "Databases" → "Create" → "Database..."
3. 填写：
   - Database: `qianyu`
   - Owner: 选择你的超级用户
   - 点击 "Save"

## 步骤4：创建用户（如果需要）

1. 展开 "Servers" → "PostgreSQL" → "Login/Group Roles"
2. 右键 → "Create" → "Login/Group Role..."
3. 在 "General" 标签页：
   - Name: `yang123`
4. 在 "Definition" 标签页：
   - Password: `yang123`
   - Confirm password: `yang123`
5. 在 "Privileges" 标签页：
   - 勾选 "Can login?"
   - 勾选 "Superuser?"（或根据需要设置）
6. 点击 "Save"

## 步骤5：执行SQL脚本创建表结构

1. 右键 "qianyu" 数据库 → "Query Tool"
2. 复制以下SQL脚本并粘贴到查询窗口：

```sql
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
```

3. 点击工具栏上的 "Execute" 按钮（绿色三角形）
4. 等待执行完成，查看是否有错误信息

## 步骤6：验证表结构

1. 展开 "qianyu" → "Schemas" → "public" → "Tables"
2. 确认所有表都已创建：
   - `user`
   - `project`
   - `canvas_state`
   - `material`
   - `usage_quota`
   - `generation_log`
   - `badge`
   - `user_badge`
   - `material_favorite`

## 步骤7：测试连接

1. 尝试使用 `yang123` 用户连接到 `qianyu` 数据库
2. 运行简单查询验证：
   ```sql
   SELECT * FROM badge;
   ```

## 常见问题

1. **连接失败**：
   - 确保PostgreSQL服务正在运行
   - 检查密码是否正确
   - 检查端口是否为5432

2. **权限错误**：
   - 确保用户有足够的权限
   - 尝试使用超级用户执行SQL

3. **表已存在**：
   - 脚本使用了 `CREATE TABLE IF NOT EXISTS`，会跳过已存在的表

完成以上步骤后，数据库表结构就创建完成了，你可以开始运行后端服务了！
