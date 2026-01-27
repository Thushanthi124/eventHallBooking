from app import create_app, db
from app.models import Booking

try:
    app = create_app()
    with app.app_context():
        booking = Booking.query.first()
        if booking:
            print(f"DEBUG_DATA: {booking.to_dict()}")
        else:
            print("DEBUG_DATA: No bookings found")
except Exception as e:
    print(f"DEBUG_ERROR: {str(e)}")
