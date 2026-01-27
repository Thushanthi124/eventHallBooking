from app import create_app, db
from app.models import Hall
import traceback
import sys

app = create_app()

def diagnose():
    with open('halls_output.txt', 'w', encoding='utf-8') as f:
        f.write("Beginning Hall Diagnosis...\n")
        with app.app_context():
            try:
                halls = Hall.query.all()
                f.write(f"Found {len(halls)} halls.\n")
                
                for i, hall in enumerate(halls):
                    f.write(f"\nScanning Hall #{i+1} (ID: {hall.id})...\n")
                    f.write(f"  Name: {hall.name}\n")
                    f.write(f"  Image: {hall.image_url}\n")
                    f.write(f"  Price: {hall.price_per_day} (Type: {type(hall.price_per_day)})\n")
                    
                    # Test serialization
                    try:
                        d = hall.to_dict()
                        f.write("  Serialization: OK\n")
                    except Exception as ser_err:
                        f.write("  Serialization: FAILED\n")
                        f.write(f"  Error: {ser_err}\n")
                        f.write(traceback.format_exc())
                        
            except Exception as e:
                f.write("CRITICAL: Failed to query halls.\n")
                f.write(str(e) + "\n")
                f.write(traceback.format_exc())

if __name__ == "__main__":
    diagnose()
