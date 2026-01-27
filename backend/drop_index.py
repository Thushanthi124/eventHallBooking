from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Attempting to drop unique index on 'username'...")
    try:
        # Try dropping the unique constraint/index. 
        # In MySQL/SQLAlchemy, the unique constraint name for a column `username` 
        # is typically `username` or `uq_users_username`.
        # We will try dropping the index `username` first.
        
        with db.engine.connect() as conn:
            conn.execute(text("DROP INDEX username ON users"))
            conn.commit()
        print("SUCCESS: Index 'username' dropped.")
    except Exception as e:
        print(f"Index 'username' drop failed (might not exist or different name): {e}")
        
    print("Migration attempt finished.")
