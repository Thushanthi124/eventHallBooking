from app import create_app
from app.models import Hall

app = create_app()
with app.app_context():
    halls = Hall.query.all()
    print(f"Total Halls: {len(halls)}")
    for h in halls:
        print(f"ID: {h.id}, Name: '{h.name}', Price: {h.price_per_day}")
