from app import create_app
import os

app = create_app()

def check_mail_config():
    with app.app_context():
        keys = ['MAIL_SERVER', 'MAIL_PORT', 'MAIL_USE_TLS', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_DEFAULT_SENDER']
        print("--- Mail Configuration Check ---")
        for key in keys:
            val = app.config.get(key)
            if val:
                print(f"{key}: SET (Length: {len(str(val))})")
                if key == 'MAIL_SERVER':
                    print(f"  Value: {val}")
                if key == 'MAIL_PORT':
                    print(f"  Value: {val}")
            else:
                print(f"{key}: NOT SET")

if __name__ == "__main__":
    check_mail_config()
