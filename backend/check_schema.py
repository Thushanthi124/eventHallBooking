from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    for table in ['users', 'halls', 'bookings']:
        print(f"\nSchema for {table}:")
        try:
            res = db.session.execute(text(f"DESCRIBE {table}"))
            for row in res:
                print(row)
        except Exception as e:
            print(f"Error describing {table}: {e}")
