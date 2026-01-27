from app import create_app, db
from sqlalchemy import text
import traceback

app = create_app()

def update_schema():
    with app.app_context():
        try:
            print("Updating Schema for Advance Payments...")
            with db.engine.connect() as conn:
                # 1. Add paid_amount column
                try:
                    conn.execute(text("ALTER TABLE bookings ADD COLUMN paid_amount NUMERIC(12, 2) DEFAULT 0"))
                    print("Added paid_amount column.")
                except Exception as e:
                    print(f"paid_amount column might already exist: {e}")

                # 2. Modify payment_status ENUM to include 'partial'
                # MySQL syntax for modifying column definition
                try:
                    # Note: We need to restate all existing values plus the new one
                    conn.execute(text("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partial') DEFAULT 'pending'"))
                    print("Updated payment_status ENUM to include 'partial'.")
                except Exception as e:
                    print(f"Error updating ENUM: {e}")
                
                conn.commit()
                print("Schema update completed.")
                
        except Exception as e:
            print("CRITICAL: Schema update failed.")
            traceback.print_exc()

if __name__ == "__main__":
    update_schema()
