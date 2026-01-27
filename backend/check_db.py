from app import create_app, db
from app.models import User
import sys

app = create_app()

with app.app_context():
    users = User.query.all()
    with open('db_status.txt', 'w', encoding='utf-8') as f:
        f.write(f"Total Users: {len(users)}\n")
        f.write("-" * 50 + "\n")
        for u in users:
            f.write(f"ID: {u.id}\n")
            f.write(f"Username: {u.username}\n")
            f.write(f"Email: {u.email}\n")
            f.write(f"Role: {u.role}\n")
            f.write(f"Verified: {u.is_verified}\n")
            # Ensure token is string
            token = str(u.verification_token) if u.verification_token else "NONE"
            f.write(f"Token: {token}\n")
            f.write("-" * 50 + "\n")
    print("DB dump completed to db_status.txt")
