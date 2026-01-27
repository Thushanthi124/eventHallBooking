from app import create_app, db
from sqlalchemy import text
import traceback

app = create_app()

def fix_schema():
    with app.app_context():
        try:
            print("Attempting to fix schema...")
            with db.engine.connect() as conn:
                # Add price_morning
                try:
                    conn.execute(text("ALTER TABLE halls ADD COLUMN price_morning NUMERIC(10, 2) DEFAULT 0"))
                    print("Added price_morning column.")
                except Exception as e:
                    print(f"price_morning column might already exist or error: {e}")

                # Add price_evening
                try:
                    conn.execute(text("ALTER TABLE halls ADD COLUMN price_evening NUMERIC(10, 2) DEFAULT 0"))
                    print("Added price_evening column.")
                except Exception as e:
                    print(f"price_evening column might already exist or error: {e}")
                
                conn.commit()
                print("Schema fix applied.")
                
        except Exception as e:
            print("Error fixing schema:")
            traceback.print_exc()

if __name__ == "__main__":
    fix_schema()
