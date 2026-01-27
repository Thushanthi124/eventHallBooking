import requests
import uuid

# Use consistent base name
duplicate_name = "Thushan"

# User 1
email1 = f"dup1_{uuid.uuid4().hex[:6]}@test.com"
data1 = {
    "username": duplicate_name,
    "email": email1,
    "password": "Password123!",
    "role": "customer"
}

# User 2
email2 = f"dup2_{uuid.uuid4().hex[:6]}@test.com"
data2 = {
    "username": duplicate_name,
    "email": email2,
    "password": "Password123!",
    "role": "customer"
}

url = "http://127.0.0.1:5000/api/auth/register"

print(f"--- Attempting Duplicate Registration ---\nName: {duplicate_name}")
try:
    print(f"\n1. Registering {email1}...")
    resp1 = requests.post(url, json=data1)
    print(f"Status: {resp1.status_code}")
    print(f"Response: {resp1.text}")
    
    print(f"\n2. Registering {email2}...")
    resp2 = requests.post(url, json=data2)
    print(f"Status: {resp2.status_code}")
    print(f"Response: {resp2.text}")
    
    if resp1.status_code == 201 and resp2.status_code == 201:
        print("\nSUCCESS: Both users registered with same username!")
    else:
        print("\nFAILURE: Duplicate registration blocked.")
        
except Exception as e:
    print(f"Error: {e}")
