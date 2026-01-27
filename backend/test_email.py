from app import create_app, mail
from flask_mail import Message
import sys

app = create_app()

def test_send_email():
    with app.app_context():
        print("Prepare to send test email...")
        recipient = app.config.get('MAIL_USERNAME')
        if not recipient:
            print("ERROR: MAIL_USERNAME not set. Cannot send test email.")
            return

        print(f"Sending test email to {recipient}...")
        try:
            msg = Message('Test Email from Nadsathira Mahal', 
                          recipients=[recipient])
            msg.body = "This is a test email to verify SMTP configuration."
            msg.html = "<h1>Test Email</h1><p>SMTP configuration is working.</p>"
            
            mail.send(msg)
            print("SUCCESS: Email sent successfully.")
        except Exception as e:
            print(f"FAILURE: Could not send email.")
            print(f"Error: {e}")

if __name__ == "__main__":
    test_send_email()
