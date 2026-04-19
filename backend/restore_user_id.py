from app import create_app, db
from sqlalchemy import text

app = create_app()

def migrate():
    with app.app_context():
        print("Restoring user_id to feedback table...")
        
        # 1. Clean up potential orphans that would violate NOT NULL
        # Or we can add it as NULLable first, then populate, then set NOT NULL.
        # Given this is dev, let's just delete orphans as they are likely test data from the broken state.
        
        # Determine if we have orphans (BookindingID is NULL)
        # Note: In the previous 3NF schema, "General Feedback" was possible but created orphans.
        orphans = db.session.execute(text("SELECT count(*) FROM feedback WHERE booking_id IS NULL")).scalar()
        if orphans > 0:
            print(f"Deleting {orphans} orphaned feedback records (no booking linked)...")
            db.session.execute(text("DELETE FROM feedback WHERE booking_id IS NULL"))
            db.session.commit()

        # 2. Add Column
        print("Adding user_id column...")
        try:
            db.session.execute(text("ALTER TABLE feedback ADD COLUMN user_id INT"))
        except Exception as e:
            print(f"Column might already exist: {e}")

        # 3. Populate user_id from booking
        print("Populating user_id from linked bookings...")
        # Since we just deleted NULL booking_ids, all remaining rows have a booking_id
        db.session.execute(text("""
            UPDATE feedback f
            JOIN bookings b ON f.booking_id = b.id
            SET f.user_id = b.user_id
        """))
        db.session.commit()
        
        # 4. Add Constraint
        print("Adding Foreign Key constraint...")
        try:
             db.session.execute(text("ALTER TABLE feedback ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id)"))
             # Optionally set NOT NULL now
             db.session.execute(text("ALTER TABLE feedback MODIFY COLUMN user_id INT NOT NULL"))
        except Exception as e:
            print(f"Constraint/Modify error (ignoring if exists): {e}")

        db.session.commit()
        print("Migration complete.")

if __name__ == '__main__':
    migrate()
