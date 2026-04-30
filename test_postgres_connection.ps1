# Test PostgreSQL connection and verify database tables

Write-Host "Testing PostgreSQL connection..." -ForegroundColor Cyan

# Find psql.exe
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "psql.exe not found in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Found psql at: $($psqlPath.Source)"
Write-Host ""

# Set password
$env:PGPASSWORD = "yang123"

# Test connection
Write-Host "Testing connection to qianyu database..." -ForegroundColor Cyan
$testResult = & $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Connection successful!" -ForegroundColor Green
} else {
    Write-Host "Connection failed: $testResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying with postgres user..." -ForegroundColor Yellow
    $env:PGPASSWORD = "postgres123"
    $testResult = & $psqlPath.Source -U postgres -h localhost -p 5432 -d qianyu -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connection with postgres successful!" -ForegroundColor Green
    } else {
        Write-Host "Connection with postgres also failed: $testResult" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Listing all tables in qianyu database..." -ForegroundColor Cyan
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "\dt"

Write-Host ""
Write-Host "Checking badge table data..." -ForegroundColor Cyan
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "SELECT * FROM badge;"

Write-Host ""
Write-Host "Testing user table..." -ForegroundColor Cyan
& $psqlPath.Source -U yang123 -h localhost -p 5432 -d qianyu -c "SELECT COUNT(*) as user_count FROM \"user\";"

# Clear password
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database verification completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
