from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    print(f"URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    h = Hall(name="Test Hall", capacity=10, price_per_day=100)
    db.session.add(h)
    db.session.commit()
    print(f"Added. Total: {Hall.query.count()}")
