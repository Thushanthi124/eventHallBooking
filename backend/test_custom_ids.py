from app import create_app, db
from app.models import User, Hall, Booking
from datetime import date, time

app = create_app()

def verify():
    with app.app_context():
        print("--- EXISTING DATA ---")
        users = User.query.limit(3).all()
        for u in users:
            print(f"User: {u.id} - {u.username}")
            assert u.id.startswith('C'), f"User ID {u.id} invalid"

        halls = Hall.query.limit(3).all()
        for h in halls:
            print(f"Hall: {h.id} - {h.name}")
            assert h.id.startswith('H'), f"Hall ID {h.id} invalid"

        bookings = Booking.query.limit(3).all()
        for b in bookings:
            print(f"Booking: {b.id} - User {b.user_id} - Hall {b.hall_id}")
            assert b.id.startswith('B'), f"Booking ID {b.id} invalid"

        print("\n--- CREATING NEW DATA ---")
        # Create User
        try:
            print("Creating User...")
            u = User(username='test_id_user', email='test_id@example.com', password_hash='hash')
            db.session.add(u)
            db.session.commit()
            print(f"Created User: {u.id}")
            assert u.id.startswith('C')
            
            # Create Hall
            print("Creating Hall...")
            h = Hall(name='Test ID Hall', capacity=100, price_per_day=50000)
            db.session.add(h)
            db.session.commit()
            print(f"Created Hall: {h.id}")
            assert h.id.startswith('H')

            # Create Booking
            print("Creating Booking...")
            b = Booking(
                user_id=u.id,
                hall_id=h.id,
                event_date=date(2026, 12, 31),
                start_time=time(10, 0),
                end_time=time(14, 0),
                phone='1234567890'
            )
            db.session.add(b)
            db.session.commit()
            print(f"Created Booking: {b.id}")
            assert b.id.startswith('B')
            
            # Cleanup
            print("Cleaning up...")
            db.session.delete(b)
            db.session.delete(h)
            db.session.delete(u)
            db.session.commit()
            print("Cleanup done.")
            
        except Exception as e:
            print(f"FAILED: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    verify()
