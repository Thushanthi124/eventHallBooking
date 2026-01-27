from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    # Force text types
    db.session.execute(text('ALTER TABLE halls MODIFY COLUMN description TEXT'))
    db.session.execute(text('ALTER TABLE halls MODIFY COLUMN location TEXT'))
    db.session.commit()
    print("Columns modified to TEXT")
