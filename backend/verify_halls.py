from app import create_app
from app.models import Hall

app = create_app()
with app.app_context():
    halls = Hall.query.all()
    for hall in halls:
        print(f"Hall: {hall.name}, Capacity: {hall.capacity}")
