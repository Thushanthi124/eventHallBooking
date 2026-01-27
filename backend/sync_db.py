from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Fix halls table
        db.session.execute(text("ALTER TABLE halls CHANGE COLUMN hall_id id INT AUTO_INCREMENT PRIMARY KEY"))
    except: pass
    try:
        db.session.execute(text("ALTER TABLE halls CHANGE COLUMN hall_name name VARCHAR(100)"))
    except: pass
    try:
        db.session.execute(text("ALTER TABLE halls CHANGE COLUMN price price_per_day NUMERIC(10, 2)"))
    except: pass
    try:
        # Add missing columns to halls
        db.session.execute(text("ALTER TABLE halls ADD COLUMN description TEXT, ADD COLUMN image_url VARCHAR(255), ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
    except: pass

    try:
        # Fix bookings table
        db.session.execute(text("ALTER TABLE bookings CHANGE COLUMN booking_id id INT AUTO_INCREMENT PRIMARY KEY"))
    except: pass
    try:
        db.session.execute(text("ALTER TABLE bookings CHANGE COLUMN customer_id user_id INT"))
    except: pass
    try:
        db.session.execute(text("ALTER TABLE bookings CHANGE COLUMN booking_date event_date DATE"))
    except: pass
    
    db.session.commit()
    print("Database sync complete.")
