#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple system status check
"""
import os
import socket

def check_port(port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except:
        return False

print("QianYu Space PC Platform - System Status")
print("=" * 50)

# Check PostgreSQL
print("\n1. PostgreSQL Database:")
try:
    import psycopg2
    conn = psycopg2.connect(host="localhost", database="qianyu", user="yang123", password="yang123", port="5432")
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    print("   [OK] PostgreSQL is running")
    print("   [OK] Database 'qianyu' exists with {} tables".format(count))
except Exception as e:
    print("   [ERROR] PostgreSQL: " + str(e))

# Check Backend
print("\n2. Backend Service (FastAPI):")
if check_port(8001):
    print("   [OK] Backend is running on port 8001")
    print("   [INFO] API Docs: http://localhost:8001/docs")
else:
    print("   [WARN] Backend is NOT running")
    print("   [HINT] cd backend && uvicorn main:app --port 8001 --reload")

# Check Frontend
print("\n3. Frontend Service (React):")
if check_port(5173):
    print("   [OK] Frontend is running on port 5173")
    print("   [INFO] URL: http://localhost:5173")
else:
    print("   [WARN] Frontend is NOT running")
    print("   [HINT] cd frontend && npm run dev")

# Check Admin
print("\n4. Admin Service:")
if check_port(5174):
    print("   [OK] Admin is running on port 5174")
    print("   [INFO] URL: http://localhost:5174")
else:
    print("   [WARN] Admin is NOT running")
    print("   [HINT] cd admin && npm run dev")

# Check Project Structure
print("\n5. Project Structure:")
for dir_name in ['backend', 'frontend', 'admin']:
    status = "[OK]" if os.path.exists(dir_name) else "[ERROR]"
    print("   {} {} directory exists".format(status, dir_name))

print("\n" + "=" * 50)
