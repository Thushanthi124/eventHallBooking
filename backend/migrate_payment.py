from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE bookings ADD COLUMN total_price DECIMAL(12, 2) DEFAULT 0"))
        db.session.execute(text("ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending'"))
        db.session.commit()
        print("Payment columns added to bookings table.")
    except Exception as e:
        db.session.rollback()
        print(f"Migration error: {e}")
