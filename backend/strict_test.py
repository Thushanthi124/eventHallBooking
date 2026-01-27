import sys
from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    try:
        hall = Hall(name="Quick Test", capacity=10, price_per_day=500, description="Test", location="Test")
        db.session.add(hall)
        db.session.commit()
        print("Success")
    except Exception as e:
        print(f"FAILED with: {type(e).__name__}: {str(e)}")
        db.session.rollback()
