# PowerShell script to create PostgreSQL database tables

Write-Host "Creating qianyu database tables..."

# Find psql.exe
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "psql.exe not found in PATH" -ForegroundColor Red
    Write-Host "Please add PostgreSQL bin directory to PATH" -ForegroundColor Red
    Write-Host "or modify this script with the correct path" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found psql at: $($psqlPath.Source)"

# Create database
Write-Host "Creating qianyu database..."
try {
    & $psqlPath.Source -U yang123 -h localhost -p 5432 -c "CREATE DATABASE qianyu;"
} catch {
    Write-Host "Database might already exist, continuing..."
}

# Create user table
Write-Host "Creating user table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS \"user\" (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, nickname VARCHAR(50) NOT NULL, avatar VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create project table
Write-Host "Creating project table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS project (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, name VARCHAR(50) NOT NULL, cover_image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create canvas_state table
Write-Host "Creating canvas_state table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS canvas_state (id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES project(id) ON DELETE CASCADE, state_data JSONB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create material table
Write-Host "Creating material table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS material (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, url VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, width INTEGER, height INTEGER, duration INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create usage_quota table
Write-Host "Creating usage_quota table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS usage_quota (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, daily_quota INTEGER DEFAULT 0, used_today INTEGER DEFAULT 0, last_reset DATE DEFAULT CURRENT_DATE);"

# Create generation_log table
Write-Host "Creating generation_log table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS generation_log (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, type VARCHAR(20) NOT NULL, prompt TEXT NOT NULL, params JSONB, duration_seconds INTEGER, image_count INTEGER, unit_cost DECIMAL(10,2) NOT NULL, total_cost DECIMAL(10,2) NOT NULL, charge_amount DECIMAL(10,2) NOT NULL, profit DECIMAL(10,2) NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMP);"

# Create badge table
Write-Host "Creating badge table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS badge (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, description TEXT, icon VARCHAR(255));"

# Create user_badge table
Write-Host "Creating user_badge table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS user_badge (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, badge_id INTEGER REFERENCES badge(id) ON DELETE CASCADE, earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create material_favorite table
Write-Host "Creating material_favorite table..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE TABLE IF NOT EXISTS material_favorite (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES \"user\"(id) ON DELETE CASCADE, material_id INTEGER REFERENCES material(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create indexes
Write-Host "Creating indexes..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email);"
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id, created_at);"
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_canvas_state_project_id ON canvas_state(project_id);"
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_material_user_id ON material(user_id, created_at);"
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at);"
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status);"

# Insert default badges
Write-Host "Inserting default badges..."
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "INSERT INTO badge (name, description, icon) VALUES ('Newbie Badge', 'Complete first registration', '/badges/newbie.png'), ('Creator Badge', 'Generate first work', '/badges/creator.png'), ('Collector Badge', 'Favorite 10 materials', '/badges/collector.png'), ('Active Badge', 'Login for 7 consecutive days', '/badges/active.png'), ('VIP Badge', 'Upgrade to VIP user', '/badges/vip.png');"

Write-Host ""
Write-Host "All database tables created successfully!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
