import time
import threading
import os
from datetime import datetime, timedelta
from flask import render_template
from flask_mail import Message
from app import db, mail
from app.models import Booking, Notification, User, Hall

def run_reminder_loop(app):
    with app.app_context():
        while True:
            try:
                check_and_send_reminders()
            except Exception as e:
                print(f"Error in automated reminder loop: {e}")
            
            # Sleep for 1 hour before checking again
            # For testing, it could be set lower, but 1 hour is safe for production
            time.sleep(60 * 60) 

def check_and_send_reminders():
    today = datetime.utcnow().date()
    target_date = today + timedelta(days=3)
    
    upcoming_bookings = Booking.query.filter_by(status='confirmed', event_date=target_date).all()
    
    for booking in upcoming_bookings:
        # Check if reminder already sent to prevent spamming the user
        existing_reminder = Notification.query.filter_by(booking_id=booking.id).filter(
            Notification.message.like('%Upcoming Event Reminder%')
        ).first()
        
        if not existing_reminder:
            user = User.query.get(booking.user_id)
            hall = Hall.query.get(booking.hall_id)
            
            # 1. Create In-App Notification
            notification_msg = f"Upcoming Event Reminder: Your event at {hall.name} is just 3 days away on {booking.event_date.strftime('%b %d, %Y')}!"
            new_notif = Notification(
                user_id=booking.user_id,
                booking_id=booking.id,
                message=notification_msg
            )
            db.session.add(new_notif)
            
            # 2. Send Email
            try:
                subject = 'Event Reminder: 3 Days Left! - Nadsathira Mahal'
                html_body = render_template('email/reminder.html', 
                                          user_name=user.username,
                                          hall_name=hall.name,
                                          event_date=booking.event_date.strftime('%B %d, %Y'),
                                          start_time=booking.start_time.strftime('%H:%M'),
                                          end_time=booking.end_time.strftime('%H:%M'),
                                          guests=booking.guests)
                msg = Message(subject, recipients=[user.email])
                msg.html = html_body
                mail.send(msg)
                print(f"Sent reminder email and notification for Booking {booking.id}")
            except Exception as e:
                print(f"Failed to send email reminder for {booking.id}: {e}")
                
            db.session.commit()

def start_scheduler(app):
    # Only start the thread in the main Flask process (avoids duplicate threads with debug reloader)
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        thread = threading.Thread(target=run_reminder_loop, args=(app,), daemon=True)
        thread.start()
        print("Started Automated Reminder Background Scheduler")
