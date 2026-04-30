#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test backend API endpoints
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8001"

print("Testing backend API endpoints...")
print("-" * 50)

# Test 1: Check if API is running
print("\n[TEST 1] Checking if backend API is running...")
try:
    response = requests.get("{}/docs".format(BASE_URL), timeout=5)
    if response.status_code == 200:
        print("[OK] Backend API is running")
        print("     API Documentation: {}/docs".format(BASE_URL))
    else:
        print("[ERROR] Backend API returned status code: {}".format(response.status_code))
except Exception as e:
    print("[ERROR] Cannot connect to backend API: {}".format(e))
    print("\nPlease start the backend server first:")
    print("  cd backend")
    print("  uvicorn main:app --host 0.0.0.0 --port 8001 --reload")
    sys.exit(1)

# Test 2: Check OpenAPI spec
print("\n[TEST 2] Checking OpenAPI specification...")
try:
    response = requests.get("{}/openapi.json".format(BASE_URL), timeout=5)
    if response.status_code == 200:
        spec = response.json()
        print("[OK] OpenAPI spec available")
        print("     API Title: {}".format(spec.get('info', {}).get('title', 'N/A')))
        print("     API Version: {}".format(spec.get('info', {}).get('version', 'N/A')))
        paths = spec.get('paths', {})
        print("     Number of endpoints: {}".format(len(paths)))
    else:
        print("[ERROR] Failed to get OpenAPI spec")
except Exception as e:
    print("[ERROR] Error: {}".format(e))

# Test 3: Check health endpoint
print("\n[TEST 3] Checking health endpoint...")
try:
    response = requests.get("{}/health".format(BASE_URL), timeout=5)
    if response.status_code == 200:
        print("[OK] Health endpoint available")
        print("     Response: {}".format(response.text))
    elif response.status_code == 404:
        print("[INFO] Health endpoint not found (optional)")
    else:
        print("[WARN] Health endpoint returned: {}".format(response.status_code))
except Exception as e:
    print("[WARN] Health endpoint error: {}".format(e))

# Test 4: List available endpoints
print("\n[TEST 4] Available API endpoints:")
try:
    response = requests.get("{}/openapi.json".format(BASE_URL), timeout=5)
    spec = response.json()
    paths = spec.get('paths', {})

    # Categorize endpoints
    auth_endpoints = []
    project_endpoints = []
    canvas_endpoints = []
    material_endpoints = []
    generation_endpoints = []
    other_endpoints = []

    for path, methods in paths.items():
        for method in methods.keys():
            endpoint = "{} {}".format(method.upper(), path)
            if '/auth' in path:
                auth_endpoints.append(endpoint)
            elif '/projects' in path:
                project_endpoints.append(endpoint)
            elif '/canvas' in path:
                canvas_endpoints.append(endpoint)
            elif '/materials' in path:
                material_endpoints.append(endpoint)
            elif '/generation' in path or '/generate' in path:
                generation_endpoints.append(endpoint)
            else:
                other_endpoints.append(endpoint)

    if auth_endpoints:
        print("   Auth endpoints:")
        for ep in auth_endpoints[:5]:
            print("     - {}".format(ep))
        if len(auth_endpoints) > 5:
            print("     ... and {} more".format(len(auth_endpoints) - 5))

    if project_endpoints:
        print("   Project endpoints:")
        for ep in project_endpoints[:5]:
            print("     - {}".format(ep))
        if len(project_endpoints) > 5:
            print("     ... and {} more".format(len(project_endpoints) - 5))

    if generation_endpoints:
        print("   Generation endpoints:")
        for ep in generation_endpoints[:5]:
            print("     - {}".format(ep))
        if len(generation_endpoints) > 5:
            print("     ... and {} more".format(len(generation_endpoints) - 5))

except Exception as e:
    print("[ERROR] Error listing endpoints: {}".format(e))

print("\n" + "-" * 50)
print("API endpoint testing completed!")
print("\nNext steps:")
print("1. Frontend: cd frontend && npm install && npm run dev")
print("2. Admin: cd admin && npm install && npm run dev")
print("3. Access frontend at: http://localhost:5173")
print("4. Access admin at: http://localhost:5174")
