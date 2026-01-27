from app import create_app, db
from app.models import Hall
from sqlalchemy import text

app = create_app()
with app.app_context():
    # Delete existing halls safely
    try:
        db.session.execute(text('DELETE FROM bookings')) # Cascading delete manually if needed
        db.session.execute(text('DELETE FROM halls'))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Delete failed: {e}")
    
    halls = [
        Hall(
            name="The Royal Raj Mahal", 
            capacity=1000, 
            price_per_day=75000, 
            description="Experience ultimate luxury in our flagship ballroom. Featuring hand-carved pillars, crystal chandeliers, and a massive stage for grand weddings.",
            location="Ground Floor, Main Wing"
        ),
        Hall(
            name="Sapphire Banquet", 
            capacity=500, 
            price_per_day=35000, 
            description="Modern, chic, and fully air-conditioned. Perfect for corporate events, engagement parties, and medium-sized celebrations.",
            location="First Floor, North Wing"
        ),
        Hall(
            name="Emerald Garden Suite", 
            capacity=300, 
            price_per_day=20000, 
            description="An intimate setting with a view of our manicured lawns. Ideal for birthday parties, seminars, and private family dinners.",
            location="Garden Side, East Wing"
        )
    ]
    
    db.session.add_all(halls)
    db.session.commit()
    print("Premium Halls Seeded!")
