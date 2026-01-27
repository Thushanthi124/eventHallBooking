from app import create_app
from app.models import User

app = create_app()

def list_staff():
    with app.app_context():
        staff = User.query.filter_by(role='staff').all()
        print(f"Total Staff Found: {len(staff)}")
        for s in staff:
            print(f"ID: {s.id}, Username: {s.username}, Email: {s.email}, Role: {s.role}, Type: {s.staff_type}")

if __name__ == "__main__":
    list_staff()
