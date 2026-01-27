from app import create_app, db
from sqlalchemy import text
from app.models import StaffAssignment

app = create_app()
with app.app_context():
    # Update users table
    try:
        db.session.execute(text("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'staff') DEFAULT 'customer'"))
        db.session.execute(text("ALTER TABLE users ADD COLUMN staff_type ENUM('kitchen', 'cleaning', 'waiter', 'none') DEFAULT 'none'"))
        db.session.commit()
        print("Updated users table with staff roles.")
    except Exception as e:
        db.session.rollback()
        print(f"Users table update skipped/failed: {e}")

    # Create assignments table
    try:
        db.create_all()
        print("Assignments table created (if not exists).")
    except Exception as e:
        print(f"Create all failed: {e}")
