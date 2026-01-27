from app import create_app, db
from app.models import Hall
import sys

app = create_app()

with app.app_context():
    halls = Hall.query.all()
    if not halls:
        print("NO HALLS FOUND")
    for h in halls:
        print(f"ID: {h.id} | Name: {h.name} | Image: {h.image_url}")
