from app import create_app, db
from sqlalchemy import text
from app.models import Hall, User, Booking

app = create_app()
with app.app_context():
    # Only if absolutely necessary
    print("Recreating tables...")
    try:
        db.session.execute(text('SET FOREIGN_KEY_CHECKS = 0'))
        db.session.execute(text('DROP TABLE IF EXISTS assignments'))
        db.drop_all()
        db.create_all()
        db.session.execute(text('SET FOREIGN_KEY_CHECKS = 1'))
        print("Tables recreated successfully.")
        
        # Seed premium halls immediately
        halls = [
            Hall(name="The Royal Raj Mahal", capacity=1000, price_per_day=75000, description="Experience ultimate luxury.", location="Ground Floor, Main Wing", image_url="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop"),
            Hall(name="Sapphire Banquet", capacity=500, price_per_day=35000, description="Modern, chic, and fully air-conditioned.", location="First Floor, North Wing", image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc6?q=80&w=800&auto=format&fit=crop"),
            Hall(name="Emerald Garden Suite", capacity=300, price_per_day=20000, description="An intimate setting with a view.", location="Garden Side, East Wing", image_url="https://images.unsplash.com/photo-1587271407850-4d43cf09c498?q=80&w=800&auto=format&fit=crop")
        ]
        db.session.add_all(halls)
        
        # Seed test admin/customer too
        from werkzeug.security import generate_password_hash
        admin = User(username='admin', email='admin@example.com', password_hash=generate_password_hash('admin123'), role='admin', is_verified=True)
        customer = User(username='customer', email='customer@example.com', password_hash=generate_password_hash('customer123'), role='customer', is_verified=True)
        db.session.add_all([admin, customer])
        
        db.session.commit()
        print("Database Seeded with Premium Content!")
    except Exception as e:
        db.session.rollback()
        print(f"FAILED: {e}")

