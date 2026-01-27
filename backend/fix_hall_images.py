from app import create_app, db
from app.models import Hall

app = create_app()
with app.app_context():
    # Hall 1
    h1 = Hall.query.filter_by(name="The Royal Raj Mahal").first()
    if h1:
        h1.image_url = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop"
        print(f"Updated Hall 1")

    # Hall 2
    h2 = Hall.query.filter_by(name="Sapphire Banquet").first()
    if h2:
        h2.image_url = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc6?q=80&w=800&auto=format&fit=crop"
        print(f"Updated Hall 2")
    
    # Hall 3
    h3 = Hall.query.filter_by(name="Emerald Garden Suite").first()
    if h3:
        h3.image_url = "https://images.unsplash.com/photo-1587271407850-4d43cf09c498?q=80&w=800&auto=format&fit=crop"
        print(f"Updated Hall 3")

    db.session.commit()
    print("Commit complete.")
