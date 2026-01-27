import requests

# Token taken from db_status.txt for user Thushan
token = "77ac019a-072f-40cd-9041-c2300c258a18"
url = f"http://127.0.0.1:5000/api/auth/verify/{token}"

print(f"Attempting to verify token: {token}")
try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
