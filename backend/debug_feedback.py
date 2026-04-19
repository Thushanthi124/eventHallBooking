from app import create_app, db
from app.models import Feedback, Booking, User
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("--- Feedback Table Content ---")
    feedbacks = db.session.execute(text("SELECT * FROM feedback")).fetchall()
    for f in feedbacks:
        print(f)
        
    print("\n--- Testing Admin Query ---")
    results = db.session.query(Feedback, Booking, User)\
        .join(Booking, Feedback.booking_id == Booking.id)\
        .join(User, Booking.user_id == User.id)\
        .all()
    print(f"Query returned {len(results)} rows.")
