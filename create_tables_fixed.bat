@echo off
chcp 65001 >nul

:: 查找psql.exe的路径
for /f "delims=" %%i in ('where psql 2^>nul') do set PSQL_PATH=%%i

if not defined PSQL_PATH (
    echo psql.exe not found in PATH
    echo Please add PostgreSQL bin directory to PATH
    echo or modify this script with the correct path
    pause
    exit /b 1
)

echo Found psql at: %PSQL_PATH%
echo.

echo Creating qianyu database...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -c "CREATE DATABASE qianyu;"
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)

echo Creating user table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS \"user\" (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, nickname VARCHAR(50) NOT NULL, avatar VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating project table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS project (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, name VARCHAR(50) NOT NULL, cover_image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating canvas_state table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS canvas_state (id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES project(id) ON DELETE CASCADE, state_data JSONB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating material table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS material (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, url VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, width INTEGER, height INTEGER, duration INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating usage_quota table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS usage_quota (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, daily_quota INTEGER DEFAULT 0, used_today INTEGER DEFAULT 0, last_reset DATE DEFAULT CURRENT_DATE);"

echo Creating generation_log table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS generation_log (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, prompt TEXT NOT NULL, params JSONB, duration_seconds INTEGER, image_count INTEGER, unit_cost DECIMAL(10,2) NOT NULL, total_cost DECIMAL(10,2) NOT NULL, charge_amount DECIMAL(10,2) NOT NULL, profit DECIMAL(10,2) NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMP);"

echo Creating badge table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS badge (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, description TEXT, icon VARCHAR(255));"

echo Creating user_badge table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS user_badge (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE, earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating material_favorite table...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS material_favorite (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, material_id INTEGER REFERENCES material(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo Creating indexes...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email);"
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at);"
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id);"
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at);"
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at);"
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status);"

echo Inserting default badges...
%PSQL_PATH% -U yang123 -h localhost -p 5432 -d qianyu -c "INSERT INTO badge (name, description, icon) VALUES ('Newbie Badge', 'Complete first registration', '/badges/newbie.png'), ('Creator Badge', 'Generate first work', '/badges/creator.png'), ('Collector Badge', 'Favorite 10 materials', '/badges/collector.png'), ('Active Badge', 'Login for 7 consecutive days', '/badges/active.png'), ('VIP Badge', 'Upgrade to VIP user', '/badges/vip.png');"

echo.
echo All database tables created successfully!
echo.
pause
