from app import create_app, db
from app.models import Hall

app = create_app()

with app.app_context():
    # Check if halls exist
    if Hall.query.count() == 0:
        print("Seeding 3 Halls...")
        halls = [
            Hall(
                name="Grand Ballroom",
                capacity=500,
                price_per_day=150000,
                price_morning=80000,
                price_evening=120000,
                location="Main Floor",
                description="Our largest venue, perfect for weddings and grand receptions. Features crystal chandeliers and a spacious dance floor.",
                image_url="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Sapphire Hall",
                capacity=200,
                price_per_day=80000,
                price_morning=45000,
                price_evening=65000,
                location="First Floor",
                description="An elegant space for intimate gatherings, birthday parties, and corporate events.",
                image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc6?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Jade Garden",
                capacity=150,
                price_per_day=60000,
                price_morning=35000,
                price_evening=50000,
                location="Outdoor / Garden",
                description="A beautiful open-air venue surrounded by lush greenery. Ideal for evening parties and outdoor ceremonies.",
                image_url="https://images.unsplash.com/photo-1533169461206-c8f376d8b31d?auto=format&fit=crop&q=80&w=800"
            )
        ]
        
        for h in halls:
            db.session.add(h)
        
        db.session.commit()
        print("Success: 3 Halls added.")
    else:
        print("Halls already exist. Skipping seed.")
