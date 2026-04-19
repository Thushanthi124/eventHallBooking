import os
from dotenv import load_dotenv

# Base directory of the project
basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from the .env file
load_dotenv(os.path.join(basedir, '.env'))

print("--- CONFIG LOADED ---")
print(f"MAIL_USERNAME: {os.environ.get('MAIL_USERNAME')}")
# Masking the password for security in logs
print(f"MAIL_PASSWORD: {'*' * 5 if os.environ.get('MAIL_PASSWORD') else 'None'}")


class Config:
    """
    Configuration settings for the Flask application.
    These settings govern the database connection, security keys, and email configuration.
    """
    # Secret key for signing session cookies and other security-related needs
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    
    # Database connection string. Supports overrides via environment variables.
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get('DATABASE_URL')
        or 'mysql+mysqlconnector://root:thushy96@localhost/wedding_hall_db'
    )
    
    # Disable modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # --- Mail Server Configuration ---
    # Used for sending emails (e.g. password resets, booking confirmations).
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or MAIL_USERNAME

