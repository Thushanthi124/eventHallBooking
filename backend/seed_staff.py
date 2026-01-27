from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import uuid

app = create_app()

def seed_staff():
    with app.app_context():
        # Check for existing staff
        staff_count = User.query.filter_by(role='staff').count()
        print(f"Current Staff Count: {staff_count}")
        
        if staff_count == 0:
            print("No staff found. Seeding default staff members...")
            
            staff_members = [
                {'username': 'Kitchen Manager', 'email': 'kitchen@hotel.com', 'type': 'kitchen'},
                {'username': 'Head Waiter', 'email': 'waiter@hotel.com', 'type': 'waiter'},
                {'username': 'Cleaning Lead', 'email': 'clean@hotel.com', 'type': 'cleaning'},
            ]
            
            for s in staff_members:
                new_staff = User(
                    username=s['username'],
                    email=s['email'],
                    password_hash=generate_password_hash('password123'),
                    role='staff',
                    staff_type=s['type'],
                    is_verified=True,
                    verification_token=None
                )
                db.session.add(new_staff)
                print(f"Added: {s['username']} ({s['type']})")
            
            db.session.commit()
            print("Staff seeding complete. Password for all is 'password123'")
        else:
            print("Staff already exist. No action taken.")

if __name__ == "__main__":
    seed_staff()
