from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    # List all columns
    cols = [row[0] for row in db.session.execute(text("DESCRIBE halls"))]
    print(f"Current columns: {cols}")
    
    if 'location' not in cols:
        db.session.execute(text('ALTER TABLE halls ADD COLUMN location VARCHAR(200)'))
        print("Added location")
    
    if 'description' not in cols:
        db.session.execute(text('ALTER TABLE halls ADD COLUMN description TEXT'))
        print("Added description")

    if 'image_url' not in cols:
        db.session.execute(text('ALTER TABLE halls ADD COLUMN image_url VARCHAR(255)'))
        print("Added image_url")
        
    db.session.commit()
    print("Migration complete")
