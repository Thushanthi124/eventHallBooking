from app import create_app, db
from sqlalchemy import text
import traceback

app = create_app()

def migrate_owners():
    with app.app_context():
        try:
            print("Attempting to migrate owner_id to halls table...")
            with db.engine.connect() as conn:
                # Add owner_id column
                try:
                    # Check if column exists first could be done, but simple try-catch is okay for this one-off
                    conn.execute(text("ALTER TABLE halls ADD COLUMN owner_id INT"))
                    print("Added owner_id column.")
                except Exception as e:
                    print(f"owner_id column might already exist or error: {e}")

                # Add Foreign Key
                try:
                    conn.execute(text("ALTER TABLE halls ADD CONSTRAINT fk_hall_owner FOREIGN KEY (owner_id) REFERENCES hall_owners(owner_id)"))
                    print("Added foreign key constraint.")
                except Exception as e:
                    print(f"Foreign key might already exist or error: {e}")
                
                conn.commit()
                print("Migration applied.")
                
        except Exception as e:
            print("Error fixing schema:")
            traceback.print_exc()

if __name__ == "__main__":
    migrate_owners()
