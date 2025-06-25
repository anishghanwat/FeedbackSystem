#!/usr/bin/env python3
"""
Test script to verify username validation
"""

import requests

def test_username_validation():
    base_url = "http://127.0.0.1:8000"
    
    # Test 1: Valid username (should succeed)
    print("Test 1: Valid username")
    response = requests.post(f"{base_url}/auth/register", json={
        'name': 'Valid User',
        'username': 'validuser',
        'email': 'valid@example.com',
        'password': 'password123',
        'role': 'employee'
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test 2: Username with spaces (should fail)
    print("Test 2: Username with spaces")
    response = requests.post(f"{base_url}/auth/register", json={
        'name': 'Invalid User',
        'username': 'invalid user',
        'email': 'invalid@example.com',
        'password': 'password123',
        'role': 'employee'
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test 3: Username too short (should fail)
    print("Test 3: Username too short")
    response = requests.post(f"{base_url}/auth/register", json={
        'name': 'Short User',
        'username': 'ab',
        'email': 'short@example.com',
        'password': 'password123',
        'role': 'employee'
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test 4: Username too long (should fail)
    print("Test 4: Username too long")
    response = requests.post(f"{base_url}/auth/register", json={
        'name': 'Long User',
        'username': 'thisusernameiswaytoolongforvalidation',
        'email': 'long@example.com',
        'password': 'password123',
        'role': 'employee'
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    test_username_validation() 