import sys
from app import create_app, db
from app.models import Hall

app = create_app()

try:
    with app.app_context():
        halls = Hall.query.all()
        print(f"Found {len(halls)} halls.")
        for hall in halls:
            print(f"Hall: {hall.name}, Image: {hall.image_url}")
except Exception as e:
    print("Error reading halls:")
    print(e)
