import sys
from app import create_app, db
from app.models import Hall
from sqlalchemy import text

app = create_app()

def update_hall_details():
    with app.app_context():
        try:
            print("Updating Hall Details...")
            
            # 1. Update Grand Ballroom (Capacity 500)
            gb = Hall.query.filter_by(name="Grand Ballroom").first()
            if gb:
                gb.capacity = 500
                print("Updated Grand Ballroom capacity to 500.")
            
            # 2. Rename Sapphire Hall -> Nadsathira Hall (Capacity 1000)
            # Check if already renamed
            nh = Hall.query.filter_by(name="Nadsathira Hall").first()
            sh = Hall.query.filter_by(name="Sapphire Hall").first()
            
            if nh:
                nh.capacity = 1000
                # Make sure image is also updated if needed (retaining sapphire image for now but mapped to new name)
                # In Home.jsx we map "Nadsathira Hall" to the image. 
                # In DB we should probably update the image URL to match the file we have or keep consistent.
                # currently: /halls/sapphire_hall.png
                # We can keep the file name as is or rename it. For now, just update name/capacity.
                print("Updated Nadsathira Hall capacity to 1000.")
            elif sh:
                sh.name = "Nadsathira Hall"
                sh.capacity = 1000
                # Optional: Update image_url if we decide to rename the file, but for now keep matching logic
                print("Renamed Sapphire Hall to Nadsathira Hall and set capacity to 1000.")
            else:
                print("Warning: Neither Sapphire Hall nor Nadsathira Hall found.")

            # 3. Update Jade Garden (Capacity 400)
            jg = Hall.query.filter_by(name="Jade Garden").first()
            if jg:
                jg.capacity = 400
                print("Updated Jade Garden capacity to 400.")
            
            db.session.commit()
            print("Database updates committed successfully.")
            
        except Exception as e:
            print(f"Error updating halls: {e}")
            db.session.rollback()

if __name__ == "__main__":
    update_hall_details()
