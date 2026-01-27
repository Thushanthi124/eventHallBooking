from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    halls = Hall.query.all()
    print(f"Found {len(halls)} halls.")
    for h in halls:
        print(f"ID: {h.id} | Name: {h.name} | Image: {h.image_url}")
