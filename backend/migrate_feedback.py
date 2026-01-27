from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Modifying Feedback table...")
    # SQLite doesn't support altering column nullability directly easily. 
    # But usually for development we can try specific pragmas or just recreate table. 
    # For now, let's try to just use raw SQL to adjust if possible, or usually 
    # we just ignore enforcing it at DB level if using SQLite without strict mode, 
    # but SQLAlchemy model definition matters for validation.
    # Note: SQLite DOES NOT support ALTER COLUMN.
    # We will rename table, create new one, and copy data.
    
    try:
        with db.session.begin():
            # 1. Rename existing table
            db.session.execute(text("ALTER TABLE feedback RENAME TO feedback_old;"))
            
            # 2. Create new table (Constraint validation off)
            db.session.execute(text("""
                CREATE TABLE feedback (
                    id INTEGER NOT NULL, 
                    booking_id INTEGER, 
                    user_id INTEGER NOT NULL, 
                    rating INTEGER, 
                    comments TEXT, 
                    admin_response TEXT, 
                    created_at DATETIME, 
                    PRIMARY KEY (id), 
                    FOREIGN KEY(booking_id) REFERENCES bookings (id), 
                    FOREIGN KEY(user_id) REFERENCES users (id)
                );
            """))
            
            # 3. Copy data
            db.session.execute(text("""
                INSERT INTO feedback (id, booking_id, user_id, rating, comments, admin_response, created_at)
                SELECT id, booking_id, user_id, rating, comments, admin_response, created_at FROM feedback_old;
            """))
            
            # 4. Drop old table
            db.session.execute(text("DROP TABLE feedback_old;"))
            
        print("Schema update successful! booking_id is now optional.")
    except Exception as e:
        print(f"Error updating schema: {e}")
