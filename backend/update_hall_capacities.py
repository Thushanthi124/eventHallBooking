from app import create_app, db
from app.models import Hall

def update_capacities():
    app = create_app()
    with app.app_context():
        # Halls to update
        updates = {
            "The Royal Raj Mahal": 1000,
            "Sapphire Banquet": 500,
            "Emerald Garden Suite": 300
        }
        
        updated_count = 0
        
        for name, new_capacity in updates.items():
            hall = Hall.query.filter_by(name=name).first()
            if hall:
                print(f"Updating '{name}' capacity from {hall.capacity} to {new_capacity}...")
                hall.capacity = new_capacity
                updated_count += 1
            else:
                print(f"Warning: Hall '{name}' not found!")
        
        if updated_count > 0:
            try:
                db.session.commit()
                print(f"Successfully updated {updated_count} halls.")
            except Exception as e:
                db.session.rollback()
                print(f"Error updating database: {e}")
        else:
            print("No halls were updated.")

if __name__ == "__main__":
    update_capacities()
