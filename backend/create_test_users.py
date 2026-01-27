from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Clear existing users if any (to avoid duplicates during test)
    # User.query.delete()
    
    # Create Admin
    admin = User(
        username='admin',
        email='admin@example.com',
        password_hash=generate_password_hash('admin123'),
        role='admin',
        is_verified=True
    )
    
    # Create Customer
    customer = User(
        username='customer',
        email='customer@example.com',
        password_hash=generate_password_hash('customer123'),
        role='customer',
        is_verified=True
    )
    
    try:
        db.session.add(admin)
        db.session.add(customer)
        db.session.commit()
        print("Demo users created successfully!")
        print("Admin: admin@example.com / admin123")
        print("Customer: customer@example.com / customer123")
    except Exception as e:
        db.session.rollback()
        print(f"Error creating users: {e}")
