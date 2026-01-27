import requests
import json
import uuid

random_id = str(uuid.uuid4())[:8]
username = f"testuser_{random_id}"
email = f"test_{random_id}@example.com"
password = "Password123!"

url = "http://127.0.0.1:5000/api/auth/register"
data = {
    "username": username,
    "email": email,
    "password": password,
    "role": "customer"
}

print(f"Attempting register for {email}...")
try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    
    try:
        json_resp = response.json()
        if 'debug' in json_resp:
            print("--- DEBUG INFO ---")
            print(json.dumps(json_resp['debug'], indent=2))
            with open('debug_final.txt', 'w') as f:
                json.dump(json_resp['debug'], f, indent=2)
            print("------------------")
        else:
            print("No debug info in response.")
            print(response.text[:200]) # First 200 chars
            
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        print(response.text[:200])

except Exception as e:
    print(f"Request failed: {e}")
