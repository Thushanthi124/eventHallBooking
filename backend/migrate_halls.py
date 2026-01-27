from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE halls ADD COLUMN location VARCHAR(200)'))
        db.session.commit()
        print("Added location column to halls table")
    except Exception as e:
        db.session.rollback()
        print(f"Location column might already exist: {e}")
