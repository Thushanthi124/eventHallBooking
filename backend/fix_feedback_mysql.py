from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Fixing Feedback table for MySQL...")
    try:
        with db.session.begin():
            # 1. Fix id to be AUTO_INCREMENT
            # Note: In MySQL, the column must be a key to be auto_increment, which it is (PRIMARY KEY).
            print("Adding AUTO_INCREMENT to id...")
            db.session.execute(text("ALTER TABLE feedback MODIFY COLUMN id INT AUTO_INCREMENT;"))
            
            # 2. Ensure booking_id is nullable
            print("Ensuring booking_id is nullable...")
            db.session.execute(text("ALTER TABLE feedback MODIFY COLUMN booking_id INT NULL;"))
            
        print("Schema fix successful!")
    except Exception as e:
        print(f"Error updating schema: {e}")
