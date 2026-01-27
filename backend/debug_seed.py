import traceback
from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    try:
        halls_data = [
            {"name": "The Royal Raj Mahal", "capacity": 600, "price_per_day": 75000, "description": "Luxe", "location": "Ground"},
            {"name": "Sapphire Banquet", "capacity": 300, "price_per_day": 35000, "description": "Chic", "location": "First"}
        ]
        for h in halls_data:
            if not Hall.query.filter_by(name=h['name']).first():
                db.session.add(Hall(**h))
        db.session.commit()
        print("Success")
    except:
        traceback.print_exc()
