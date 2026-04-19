import mysql.connector  # Unused import, but kept as is for checking mysql connector availability
import os
from dotenv import load_dotenv

# Load environment variables from the .env file located in the backend folder
load_dotenv('backend/.env')

# Retrieve the database connection URL from the environment variables.
# If it's not set, use the fallback default local database URL.
url = os.environ.get('DATABASE_URL') or 'mysql+mysqlconnector://root:thushy96@localhost/wedding_hall_db'
print(f"Connecting to: {url}")

try:
    # Import SQLAlchemy modules for manual database connection checking
    import sqlalchemy
    from sqlalchemy import create_engine
    
    # Create a database engine using the connection URL
    engine = create_engine(url)
    
    # Attempt to open a connection to the database
    connection = engine.connect()
    print("SQLAlchemy Connection successful!")
    
    # Close the connection immediately as this is just a test script
    connection.close()
except Exception as e:
    # Catch any connection errors and print them
    print(f"SQLAlchemy Connection failed: {e}")

