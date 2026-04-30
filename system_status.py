#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete system test and status check
"""
import os
import sys
import subprocess
import socket

def check_port(port):
    """Check if a port is in use"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

print("="*60)
print("  QianYu Space PC Platform - System Status Check")
print("="*60)

# Check 1: PostgreSQL Database
print("\n[CHECK 1] PostgreSQL Database")
print("-" * 60)
try:
    import psycopg2
    conn = psycopg2.connect(
        host="localhost",
        database="qianyu",
        user="yang123",
        password="yang123",
        port="5432"
    )
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'")
    table_count = cur.fetchone()[0]
    cur.close()
    conn.close()
    print("  [OK] PostgreSQL is running")
    print("  [OK] Database 'qianyu' exists")
    print("  [OK] {} tables found".format(table_count))
except Exception as e:
    print("  [ERROR] PostgreSQL connection failed: {}".format(str(e)))
    print("  [HINT] Make sure PostgreSQL is installed and running")
    print("  [HINT] Database 'qianyu' should be created with user 'yang123'")

# Check 2: Backend Service
print("\n[CHECK 2] Backend Service (FastAPI)")
print("-" * 60)
if check_port(8001):
    print("  [OK] Backend service is running on port 8001")
    print("  [INFO] API Documentation: http://localhost:8001/docs")
    print("  [INFO] API Base URL: http://localhost:8001")
else:
    print("  [WARN] Backend service is NOT running on port 8001")
    print("  [HINT] To start backend:")
    print("         cd backend")
    print("         uvicorn main:app --host 0.0.0.0 --port 8001 --reload")

# Check 3: Frontend Service
print("\n[CHECK 3] Frontend Service (React)")
print("-" * 60)
if check_port(5173):
    print("  [OK] Frontend service is running on port 5173")
    print("  [INFO] Frontend URL: http://localhost:5173")
else:
    print("  [WARN] Frontend service is NOT running on port 5173")
    print("  [HINT] To start frontend:")
    print("         cd frontend")
    print("         npm install (first time only)")
    print("         npm run dev")

# Check 4: Admin Service
print("\n[CHECK 4] Admin Service")
print("-" * 60)
if check_port(5174):
    print("  [OK] Admin service is running on port 5174")
    print("  [INFO] Admin URL: http://localhost:5174")
else:
    print("  [WARN] Admin service is NOT running on port 5174")
    print("  [HINT] To start admin:")
    print("         cd admin")
    print("         npm install (first time only)")
    print("         npm run dev")

# Check 5: Project Files
print("\n[CHECK 5] Project Structure")
print("-" * 60)
required_dirs = [
    ('backend', 'Backend service'),
    ('frontend', 'Frontend application'),
    ('admin', 'Admin management system'),
]

all_exist = True
for dir_name, description in required_dirs:
    if os.path.exists(dir_name):
        print("  [OK] {} directory exists".format(dir_name))
    else:
        print("  [ERROR] {} directory missing".format(dir_name))
        all_exist = False

# Summary
print("\n" + "="*60)
print("  System Status Summary")
print("="*60)

checks = [
    ("PostgreSQL Database", "postgres" in str(locals().get('table_count', 0))),
    ("Backend Service", check_port(8001)),
    ("Frontend Service", check_port(5173)),
    ("Admin Service", check_port(5174)),
    ("Project Files", all_exist),
]

passed = sum(1 for _, status in checks if status)
total = len(checks)

for name, status in checks:
    status_str = "PASS" if status else "FAIL"
    print("  [{}] {}".format(status_str, name))

print("\n{}/{} checks passed".format(passed, total))

if passed == total:
    print("\n[SUCCESS] All systems are ready!")
    print("\nAccess your application at:")
    print("  - Frontend: http://localhost:5173")
    print("  - Backend:  http://localhost:8001/docs")
    print("  - Admin:    http://localhost:5174")
else:
    print("\n[INFO] Some systems need attention.")
    print("[INFO] Follow the hints above to start missing services.")

print("="*60)
