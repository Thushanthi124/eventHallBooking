from flask import Flask
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv

# Load env vars same way as app
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)

# Replicate Config exactly from config.py
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT') or 587)
# Note the logic from config.py:
# MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None or True
# This logic means it is ALWAYS True.
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS') is not None or True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

print("--- Flask-Mail Configuration ---")
print(f"Server: {app.config['MAIL_SERVER']}")
print(f"Port: {app.config['MAIL_PORT']}")
print(f"TLS: {app.config['MAIL_USE_TLS']}")
print(f"Username: {app.config['MAIL_USERNAME']}")
print(f"Password: {app.config['MAIL_PASSWORD']}") # Showing password to debug EXACT value
print("------------------------------")

mail = Mail(app)

with app.app_context():
    try:
        print("Attempting to send email via Flask-Mail...")
        msg = Message("Flask-Mail Test", recipients=[app.config['MAIL_USERNAME']])
        msg.body = "This is a test from Flask-Mail."
        mail.send(msg)
        print("SUCCESS: Email sent!")
    except Exception as e:
        print(f"FAILURE: {e}")
