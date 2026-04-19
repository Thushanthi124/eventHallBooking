from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

# Initialize the Flask application
app = create_app()

# We need the app context to access the database and create users
with app.app_context():
    # Example snippet to clear users if you wanted to reset the table
    # User.query.delete()
    
    # Define an Admin user profile
    admin = User(
        username='admin',
        email='admin@example.com',
        password_hash=generate_password_hash('admin123'),  # Securely hash the password
        role='admin',
        is_verified=True  # Automatically verified for demo purposes
    )
    
    # Define a generic Customer user profile
    customer = User(
        username='customer',
        email='customer@example.com',
        password_hash=generate_password_hash('customer123'),
        role='customer',
        is_verified=True
    )
    
    try:
        # Add the created user instances to the database session
        db.session.add(admin)
        db.session.add(customer)
        
        # Commit the transaction to save the users directly in the database
        db.session.commit()
        print("Demo users created successfully!")
        print("Admin: admin@example.com / admin123")
        print("Customer: customer@example.com / customer123")
    except Exception as e:
        # Roll back if there's any error (e.g. duplicate emails)
        db.session.rollback()
        print(f"Error creating users: {e}")

