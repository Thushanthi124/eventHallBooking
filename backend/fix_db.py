from app import create_app, db
from app.models import Booking
import sqlite3

app = create_app()

with app.app_context():
    # Connect directly to sqlite to migrate the table
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    
    try:
        # Rename old table
        cursor.execute("ALTER TABLE bookings RENAME TO bookings_old;")
        conn.commit()
        
        # Have SQLAlchemy create the brand new bookings table with updated constraints
        db.create_all()
        
        # Copy data back
        # The schema of bookings has the same columns
        cursor.execute("""
            INSERT INTO bookings (id, user_id, hall_id, event_date, start_time, end_time, phone, guests, food_package_id, custom_preferences, status, total_price, paid_amount, payment_status, created_at)
            SELECT id, user_id, hall_id, event_date, start_time, end_time, phone, guests, food_package_id, custom_preferences, status, total_price, paid_amount, payment_status, created_at
            FROM bookings_old;
        """)
        conn.commit()
        
        # Drop the old table
        cursor.execute("DROP TABLE bookings_old;")
        conn.commit()
        print("Successfully migrated bookings table!")
    except Exception as e:
        print("Migration failed:", e)
        conn.rollback()
    finally:
        conn.close()
