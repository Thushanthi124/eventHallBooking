from app import create_app, db
from sqlalchemy import text
app = create_app()
with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE bookings ADD COLUMN guests INTEGER DEFAULT 50'))
        db.session.commit()
        print("Added guests column")
    except Exception as e:
        db.session.rollback()
        print(f"Guests column might already exist: {e}")

    try:
        db.session.execute(text('ALTER TABLE bookings ADD COLUMN food_package VARCHAR(50) DEFAULT "standard"'))
        db.session.commit()
        print("Added food_package column")
    except Exception as e:
        db.session.rollback()
        print(f"Food_package column might already exist: {e}")

    try:
        db.session.execute(text('ALTER TABLE bookings ADD COLUMN special_requests TEXT'))
        db.session.commit()
        print("Added special_requests column")
    except Exception as e:
        db.session.rollback()
        print(f"Special_requests column might already exist: {e}")
