from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Update Enum for status column
        db.session.execute(text("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'pending';"))
        
        # Update Enum for payment_status column
        db.session.execute(text("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partial', 'non-refundable') DEFAULT 'pending';"))
        
        db.session.commit()
        print("Success! Enums modified on MySQL DB.")
    except Exception as e:
        print("Error migrating Enums:", e)
        db.session.rollback()
