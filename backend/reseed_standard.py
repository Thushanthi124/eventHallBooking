from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    # Only add if table is nearly empty
    if Hall.query.count() < 3:
        # Clear Golden Hall if it exists (user didn't want it)
        # Hall.query.filter_by(name="Golden Hall").delete()
        
        halls = [
            Hall(name="Nadsathira Grand Hall", capacity=500, price_per_day=45000, description="Our flagship venue for grand weddings and corporate galas."),
            Hall(name="Emerald Banquet", capacity=250, price_per_day=25000, description="A premium space with modern elegance, perfect for medium celebrations."),
            Hall(name="Crystal Suite", capacity=100, price_per_day=15000, description="An intimate setting for private parties and small gatherings.")
        ]
        
        for h in halls:
            if not Hall.query.filter_by(name=h.name).first():
                db.session.add(h)
        
        db.session.commit()
        print("Standard Halls seeded!")
    else:
        print(f"Already have {Hall.query.count()} halls.")
