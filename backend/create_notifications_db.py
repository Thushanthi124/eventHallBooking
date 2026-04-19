from app import create_app, db
from app.models import Notification

app = create_app()

with app.app_context():
    # Because we only want to create the 'notifications' table without dropping others:
    Notification.__table__.create(db.engine, checkfirst=True)
    print("Notifications table created successfully.")
