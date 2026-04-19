from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Create new tables if they don't exist (like staff_leaves)
        db.create_all()
        print("Ensured all tables are created.")
        
        # Alter staff_assignments
        # We need to add pay_rate and payment_status
        db.session.execute(text("ALTER TABLE staff_assignments ADD COLUMN pay_rate DECIMAL(10,2) DEFAULT 3000.00;"))
        db.session.execute(text("ALTER TABLE staff_assignments ADD COLUMN payment_status ENUM('pending', 'paid') DEFAULT 'pending';"))
        
        db.session.commit()
        print("Success! staff_assignments modified on MySQL DB.")
    except Exception as e:
        print("Notice:", e)
        db.session.rollback()
