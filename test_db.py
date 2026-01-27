import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
url = os.environ.get('DATABASE_URL') or 'mysql+mysqlconnector://root:thushy96@localhost/wedding_hall_db'
print(f"Connecting to: {url}")

try:
    # Manual check
    import sqlalchemy
    from sqlalchemy import create_engine
    engine = create_engine(url)
    connection = engine.connect()
    print("SQLAlchemy Connection successful!")
    connection.close()
except Exception as e:
    print(f"SQLAlchemy Connection failed: {e}")
