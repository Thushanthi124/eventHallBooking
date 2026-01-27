from app import create_app, db
from app.models import Booking

app = create_app()

with app.app_context():
    bookings = Booking.query.all()
    print(f"Found {len(bookings)} bookings.")
    for b in bookings:
        print(f"Booking ID: {b.id}")
        print(f"Raw Hall ID: {b.hall_id}")
        print(f"Hall Relationship: {b.hall}")
        if b.hall:
            print(f"Hall Name: {b.hall.name}")
        data = b.to_dict()
        print(f"to_dict['hall_name']: {data.get('hall_name')}")
        print("-" * 20)
