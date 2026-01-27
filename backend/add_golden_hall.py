from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    # Only add if not exists
    if not Hall.query.filter_by(name="Golden Hall").first():
        golden = Hall(name="Golden Hall", capacity=250, price_per_day=150000, description="As seen in the booking summary.")
        db.session.add(golden)
        db.session.commit()
        print("Added Golden Hall!")
    else:
        print("Golden Hall already exists.")
