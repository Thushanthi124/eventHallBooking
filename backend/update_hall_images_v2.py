import sys
import traceback

try:
    from app import create_app, db
    from app.models import Hall

    app = create_app()

    with app.app_context():
        try:
            halls_to_update = [
                ("Grand Ballroom", "/halls/grand_ballroom.png"),
                ("Sapphire Hall", "/halls/sapphire_hall.png"),
                ("Jade Garden", "/halls/jade_garden.jpg")
            ]
            
            updated_count = 0
            for name, new_url in halls_to_update:
                hall = Hall.query.filter_by(name=name).first()
                if hall:
                    hall.image_url = new_url
                    updated_count += 1
                    print(f"Updated {name} image to {new_url}")
                else:
                    print(f"Warning: Hall '{name}' not found.")
                    
            if updated_count > 0:
                db.session.commit()
                print(f"Successfully updated {updated_count} halls.")
            else:
                print("No halls updated.")
        except Exception as e:
            print("Error during database operation:")
            traceback.print_exc()
except Exception as e:
    print("CRITICAL ERROR:")
    traceback.print_exc()
