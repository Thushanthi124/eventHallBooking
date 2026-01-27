import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_backend_health():
    print("Testing backend connectivity...")
    try:
        # Try a simple GET that uses models (e.g., halls) ensuring DB is touched
        response = requests.get(f"{BASE_URL}/halls")
        if response.status_code == 200:
            print("[OK] Backend is reachable and serving halls.")
            print(response.json()[0] if response.json() else "No halls found but OK.")
        else:
            print(f"[FAIL] Backend returned {response.status_code}")
            print(response.text)
            sys.exit(1)
    except Exception as e:
        print(f"[CRITICAL] Could not connect to backend: {e}")
        sys.exit(1)

def get_auth_token():
    print("Logging in to get JWT token...")
    # Use the demo customer credentials
    login_data = {
        "email": "customer@example.com",
        "password": "customer123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"[OK] Login successful. Token obtained.")
            return token
        else:
            print(f"[FAIL] Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"[CRITICAL] Login request failed: {e}")
        return None

def test_mock_payment_call():
    print("\nTesting payment endpoint access (Mock)...")
    
    token = get_auth_token()
    if not token:
        print("[SKIP] Cannot test payment without token.")
        return

    try:
        # Mock payment for a non-existent booking with JWT Header
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(f"{BASE_URL}/bookings/99999/pay", headers=headers)
        
        # We expect 404 because booking 99999 likely doesn't exist, OR 500 if server is broken
        if response.status_code == 404:
            print("[OK] Endpoint reachable, returned 404 for made-up booking (Expected).")
        elif response.status_code == 200:
            print("[OK] Endpoint reachable.")
        elif response.status_code == 403:
             print("[OK] Endpoint reachable (Authorized but forbidden).")
        elif response.status_code == 401:
             print("[FAIL] JWT Token rejected (401).")
             sys.exit(1)
        else:
            print(f"[FAIL] Endpoint returned unexpected status: {response.status_code}")
            print(response.text)
            sys.exit(1)

    except Exception as e:
        print(f"[CRITICAL] Payment endpoint unreachable: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_backend_health()
    test_mock_payment_call()
