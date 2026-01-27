import sys
import traceback
from app import create_app, db
from app.models import Hall

app = create_app()

def seed_halls():
    with app.app_context():
        try:
            # Check if halls exist
            count = Hall.query.count()
            print(f"Current Hall Count: {count}")
            
            if count > 0:
                print("Halls already exist. Updating images...")
                # Update existing halls
                halls_map = {
                    "Grand Ballroom": "/halls/grand_ballroom.png",
                    "Sapphire Hall": "/halls/sapphire_hall.png",
                    "Jade Garden": "/halls/jade_garden.jpg"
                }
                for name, img in halls_map.items():
                    hall = Hall.query.filter_by(name=name).first()
                    if hall:
                        hall.image_url = img
                        print(f"Updated {name}")
                db.session.commit()
            else:
                print("Seeding new halls...")
                halls = [
                    Hall(
                        name="Grand Ballroom",
                        capacity=500,
                        price_per_day=150000,
                        price_morning=80000,
                        price_evening=120000,
                        location="Main Floor",
                        description="Our largest venue, perfect for weddings and grand receptions. Features crystal chandeliers.",
                        image_url="/halls/grand_ballroom.png"
                    ),
                    Hall(
                        name="Sapphire Hall",
                        capacity=200,
                        price_per_day=80000,
                        price_morning=45000,
                        price_evening=65000,
                        location="First Floor",
                        description="An elegant space for intimate gatherings and parties.",
                        image_url="/halls/sapphire_hall.png"
                    ),
                    Hall(
                        name="Jade Garden",
                        capacity=150,
                        price_per_day=60000,
                        price_morning=35000,
                        price_evening=50000,
                        location="Outdoor / Garden",
                        description="A beautiful open-air venue surrounded by lush greenery.",
                        image_url="/halls/jade_garden.jpg"
                    )
                ]
                for h in halls:
                    db.session.add(h)
                db.session.commit()
                print("Successfully seeded 3 halls.")
                
        except Exception as e:
            print("Error during seeding:")
            traceback.print_exc()

if __name__ == "__main__":
    seed_halls()
