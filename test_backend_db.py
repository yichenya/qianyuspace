#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test PostgreSQL database connection for backend
"""
import sys
import os

# Change to backend directory
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("Testing backend database connection...")
print("Current directory:", os.getcwd())
print("-" * 50)

try:
    # Import database connection
    from app.core.database import engine, SessionLocal
    from sqlalchemy import text

    # Test connection
    print("[OK] Database engine created successfully")

    # Create session
    db = SessionLocal()
    print("[OK] Database session created successfully")

    # Test query with text()
    result = db.execute(text("SELECT 1"))
    print("[OK] Database query successful")

    # Check tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("[OK] Found {} tables in database:".format(len(tables)))
    for table in tables:
        print("  - {}".format(table))

    # Test user table
    result = db.execute(text('SELECT COUNT(*) FROM "user"'))
    user_count = result.scalar()
    print("[OK] User table query successful, current user count: {}".format(user_count))

    # Test badge table
    result = db.execute(text("SELECT * FROM badge"))
    badges = result.fetchall()
    print("[OK] Badge table query successful, badge count: {}".format(len(badges)))

    db.close()
    print("-" * 50)
    print("Backend database connection test PASSED!")

except Exception as e:
    print("[ERROR] Error: {}".format(e))
    print("-" * 50)
    print("Backend database connection test FAILED!")
    import traceback
    traceback.print_exc()
    sys.exit(1)
