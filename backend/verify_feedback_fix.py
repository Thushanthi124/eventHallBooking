from app import create_app, db
from app.models import User, Feedback, Booking
from sqlalchemy import text

app = create_app()

def verify():
    with app.app_context():
        print("Verifying Feedback Fix...")
        
        # 1. Get a user
        user = User.query.first()
        if not user:
            print("No user found, creating one.")
            user = User(username='feedback_tester', email='tester@test.com', password_hash='hash')
            db.session.add(user)
            db.session.commit()
            
        print(f"Using User: {user.username} (ID: {user.id})")
        
        # 2. Submit General Feedback (No Booking)
        print("Submitting General Feedback...")
        feedback = Feedback(
            booking_id=None,
            user_id=user.id,
            rating=5,
            comments="General Verification Comment"
        )
        db.session.add(feedback)
        db.session.commit()
        
        # 3. Simulate Admin Query
        print("Running Admin Query...")
        from app.models import Hall
        feedbacks = db.session.query(Feedback, Booking, User, Hall)\
            .outerjoin(Booking, Feedback.booking_id == Booking.id)\
            .join(User, Feedback.user_id == User.id)\
            .outerjoin(Hall, Booking.hall_id == Hall.id)\
            .all()
            
        found = False
        for f, b, u, h in feedbacks:
            if f.id == feedback.id:
                found = True
                print(f"✅ Found Feedback: ID={f.id}, User={u.username}, Comment='{f.comments}'")
                if b is None:
                    print("   - Correctly identified as General Feedback (No Booking)")
        
        if not found:
            print("❌ Feedback NOT found in Admin Query!")
            
        # Cleanup
        db.session.delete(feedback)
        db.session.commit()

if __name__ == '__main__':
    verify()
