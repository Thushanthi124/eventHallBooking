from flask import Blueprint, request, jsonify, render_template
from app import db, mail
from flask_mail import Message
from app.models import User, Hall, Booking, Payment, Feedback, StaffAssignment
from app.auth import token_required, admin_required, customer_or_admin, staff_required
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

bp = Blueprint('api', __name__)

@bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Username uniqueness check removed
    # if User.query.filter_by(username=data['username']).first():
    #     return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Password Validation (Strict)
    password = data['password']
    import re
    if len(password) < 8 or \
       not re.search(r"[a-z]", password) or \
       not re.search(r"[A-Z]", password) or \
       not re.search(r"\d", password) or \
       not re.search(r"[@$!%*?&]", password):
        return jsonify({'error': 'Password must be at least 8 chars with Uppercase, Lowercase, Number, and Special Symbol.'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    verification_token = str(uuid.uuid4())
    new_user = User(
        username=data['username'], 
        email=data['email'], 
        password_hash=hashed_password, 
        role=data.get('role', 'customer'),
        verification_token=verification_token
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Send verification email
    try:
        from flask import current_app
        print(f"DEBUG: MAIL_USERNAME = {current_app.config.get('MAIL_USERNAME')}")
        print(f"DEBUG: MAIL_PASSWORD = {current_app.config.get('MAIL_PASSWORD')[:3]}...") # Partial mask
        print(f"DEBUG: MAIL_DEFAULT_SENDER = {current_app.config.get('MAIL_DEFAULT_SENDER')}")
        print(f"DEBUG: MAIL_SERVER = {current_app.config.get('MAIL_SERVER')}")
        
        msg = Message('Email Verification',
                      recipients=[new_user.email])
        msg.body = f'Thank you for registering. Please verify your email by clicking the link: http://localhost:5173/verify/{verification_token}'
        mail.send(msg)
    except Exception as e:
        print(f"Error sending email: {e}")
        # STRICT MODE: Rollback and fail if email cannot be sent
        db.session.delete(new_user)
        db.session.commit()
        debug_info = {
            'username': current_app.config.get('MAIL_USERNAME'),
            'password_len': len(current_app.config.get('MAIL_PASSWORD') or ''),
            'password_prefix': (current_app.config.get('MAIL_PASSWORD') or '')[:3],
            'sender': current_app.config.get('MAIL_DEFAULT_SENDER'),
            'server': current_app.config.get('MAIL_SERVER'),
            'port': current_app.config.get('MAIL_PORT'),
            'use_tls': current_app.config.get('MAIL_USE_TLS')
        }
        return jsonify({'error': f'Could not send verification email: {str(e)}', 'debug': debug_info}), 500
    
    return jsonify({'message': 'User registered successfully. Please check your email for verification.'}), 201

@bp.route('/api/auth/verify/<token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid verification token'}), 400
    
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    
    return jsonify({'message': 'Successfully verified'}), 200


# ...

from flask import current_app
from itsdangerous import URLSafeTimedSerializer

# ...

@bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        if not user.is_verified:
            return jsonify({'error': 'Please verify your email before logging in.'}), 401
            
        # Generate Token (Dependency-free fallback)
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        token = s.dumps(user.id, salt='access-token')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User with this email does not exist'}), 404
        
    # Generate Token
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token = s.dumps(user.email, salt='reset-password')
    
    # Send Email
    try:
        msg = Message('Password Reset Request', recipients=[user.email])
        link = f'http://localhost:5173/reset-password/{token}'
        msg.body = f'Click the link to reset your password: {link}\n\nIf you did not request this, please ignore this email.'
        mail.send(msg)
    except Exception as e:
        print(f"Error sending email: {e}")
        # In debug mode, we might want to return the token or just log it
        print(f"DEBUG: Reset Link: {link}")
        return jsonify({'error': 'Could not send reset email. Please try again later.'}), 500
        
    return jsonify({'message': 'Password reset link sent to your email.'}), 200

@bp.route('/api/auth/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        email = s.loads(token, salt='reset-password', max_age=3600) # 1 hour expiration
    except Exception:
        return jsonify({'error': 'The reset link is invalid or has expired.'}), 400
        
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully. You can now login.'}), 200

@bp.route('/api/halls', methods=['GET'])
def get_halls():
    halls = Hall.query.all()
    return jsonify([hall.to_dict() for hall in halls]), 200

@bp.route('/api/halls/<int:hall_id>', methods=['GET'])
def get_hall(hall_id):
    hall = Hall.query.get(hall_id)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    return jsonify(hall.to_dict()), 200

@bp.route('/api/halls', methods=['POST'])
@admin_required
def add_hall(current_user):
    # Only admins can add halls
    data = request.get_json()
    new_hall = Hall(
        name=data['name'],
        capacity=data['capacity'],
        price_per_day=data['price_per_day'],
        location=data.get('location'),
        description=data.get('description'),
        image_url=data.get('image_url')
    )
    db.session.add(new_hall)
    db.session.commit()
    return jsonify({'message': 'Hall added successfully', 'hall': new_hall.to_dict()}), 201

@bp.route('/api/public/bookings', methods=['GET'])
def get_public_bookings():
    hall_id = request.args.get('hall_id')
    date_str = request.args.get('date')
    
    query = Booking.query.filter(Booking.status != 'rejected')
    
    if hall_id:
        query = query.filter_by(hall_id=hall_id)
        
    if date_str:
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(event_date=date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
            
    bookings = query.all()
    
    # Return minimized data for public view (availability check)
    return jsonify([{
        'event_date': b.event_date.isoformat(),
        'start_time': b.start_time.strftime('%H:%M') if b.start_time else None,
        'end_time': b.end_time.strftime('%H:%M') if b.end_time else None,
        'status': 'booked' 
    } for b in bookings]), 200

@bp.route('/api/bookings', methods=['POST'])
@customer_or_admin
def create_booking(current_user):
    data = request.get_json()
    
    # Validation
    if not data.get('phone'):
        return jsonify({'error': 'Phone number is required'}), 400
        
    phone = data['phone'].replace(' ', '').replace('-', '').replace('+', '')
    if not phone.isdigit() or len(phone) != 10:
        return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400

    # Date validation
    event_date_str = data.get('event_date')
    if not event_date_str:
        return jsonify({'error': 'Event date is required'}), 400
        
    try:
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
        if event_date < datetime.now().date():
            return jsonify({'error': 'Event date cannot be in the past'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    # Time validation & Slot Enforcement
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')
    
    if not (start_time_str and end_time_str):
        return jsonify({'error': 'Start and End times are required'}), 400

    # Allowed slots
    LUNCH_START, LUNCH_END = '08:00', '15:00'
    EVENING_START, EVENING_END = '17:00', '23:30'
    FULLDAY_START, FULLDAY_END = '08:00', '23:30'

    is_lunch = (start_time_str == LUNCH_START and end_time_str == LUNCH_END)
    is_evening = (start_time_str == EVENING_START and end_time_str == EVENING_END)
    is_fullday = (start_time_str == FULLDAY_START and end_time_str == FULLDAY_END)
    
    if not (is_lunch or is_evening or is_fullday):
         return jsonify({'error': 'Invalid time slot. Choose Morning (08:00-15:00), Evening (17:00-23:30), or Whole Day (08:00-23:30).'}), 400

    start_time = datetime.strptime(start_time_str, '%H:%M').time()
    end_time = datetime.strptime(end_time_str, '%H:%M').time()

    # Check for Double Booking
    existing_booking = Booking.query.filter(
        Booking.hall_id == data['hall_id'],
        Booking.event_date == event_date,
        Booking.status != 'rejected',
        # Overlap logic: (StartA < EndB) and (EndA > StartB)
        Booking.start_time < end_time,
        Booking.end_time > start_time
    ).first()

    if existing_booking:
        return jsonify({'error': 'Hall is already booked for this time slot.'}), 400
    
    # Calculate Total Price (Dynamic based on Slot)
    hall = Hall.query.get(data['hall_id'])
    if not hall:
         return jsonify({'error': 'Invalid Hall ID'}), 404
         
    # Determine base price based on slot
    hall_price = 0
    if is_lunch:
        hall_price = float(hall.price_morning)
    elif is_evening:
        hall_price = float(hall.price_evening)
    else:
        hall_price = float(hall.price_per_day)

    guests = int(data.get('guests', 50))

    if guests > hall.capacity:
        return jsonify({'error': f'Guest count ({guests}) exceeds hall capacity ({hall.capacity})'}), 400

    food_pkg = data.get('food_package', 'standard')
    
    # Food pricing logic
    food_rates = {'basic': 500, 'standard': 800, 'premium': 1200}
    food_price = guests * food_rates.get(food_pkg, 800)
    total_calculated = hall_price + food_price

    new_booking = Booking(
        user_id=current_user.id,
        hall_id=data['hall_id'],
        event_date=event_date,
        start_time=start_time,
        end_time=end_time,
        phone=data['phone'],
        guests=guests,
        food_package=food_pkg,
        custom_preferences=data.get('custom_preferences', ''),
        total_price=total_calculated,
        payment_status='pending'
    )
    db.session.add(new_booking)
    db.session.commit()
    
    return jsonify({
        'message': 'Booking request submitted successfully',
        'booking': new_booking.to_dict()
    }), 201

@bp.route('/api/bookings/<int:booking_id>/pay', methods=['POST'])
@token_required
def process_payment(current_user, booking_id):
    try:
        data = request.get_json() or {}
        payment_type = data.get('payment_type', 'full') # 'full' or 'advance'

        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
            
        if booking.user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        if booking.payment_status == 'paid':
             return jsonify({'message': 'Booking is already paid'}), 200

        # Calculate amount to charge
        amount_to_pay = booking.total_price
        if payment_type == 'advance':
            # Check if already paid some amount? 
            # For simplicity, if advance is requested, pay 50% of total
            # If already paid partial, paying advance again? logic checks needed
            # Assuming advance is only allowed if paid_amount is 0
            if booking.paid_amount > 0:
                 return jsonify({'error': 'Advance already paid or partial payment exists. Please pay full balance.'}), 400
            amount_to_pay = booking.total_price / 2 
        else:
            # Paying full amount
            # If partially paid, pay the difference?
            if booking.paid_amount > 0:
                amount_to_pay = booking.total_price - booking.paid_amount
        
        # Determine remaining balance after this payment
        projected_paid = (booking.paid_amount or 0) + amount_to_pay

        # Mock Payment Processing
        # In real app, integrate Stripe/PayPal here
        
        # 1. Update Booking
        booking.paid_amount = projected_paid
        
        if booking.paid_amount >= booking.total_price:
             booking.payment_status = 'paid'
        elif booking.paid_amount > 0:
             booking.payment_status = 'partial'
        
        # 2. Record Payment
        payment = Payment(
            booking_id=booking.id,
            amount=amount_to_pay,
            status='success'
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment successful',
            'payment_status': booking.payment_status,
            'booking_status': booking.status,
            'paid_amount': float(booking.paid_amount),
            'balance_due': float(booking.total_price - booking.paid_amount)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/api/bookings', methods=['GET'])
@customer_or_admin
def get_bookings(current_user):
    # Admins can see all bookings, customers see only their own
    if current_user.role == 'admin':
        bookings = Booking.query.all()
    else:
        bookings = Booking.query.filter_by(user_id=current_user.id).all()
    
    return jsonify([booking.to_dict() for booking in bookings]), 200

@bp.route('/api/bookings/<int:booking_id>', methods=['GET'])
@token_required
def get_booking(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
        
    if booking.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(booking.to_dict()), 200

@bp.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
@admin_required
def update_booking_status(current_user, booking_id):
    """Admin-only endpoint to update booking status"""
    data = request.get_json()
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if 'status' not in data:
        return jsonify({'error': 'Status field required'}), 400
    
    if data['status'] not in ['pending', 'confirmed', 'rejected']:
        return jsonify({'error': 'Invalid status value'}), 400
    
    booking.status = data['status']
    db.session.commit()
    
    # Notify user if booking is confirmed or rejected
    if booking.status in ['confirmed', 'rejected']:
        try:
            user = User.query.get(booking.user_id)
            hall = Hall.query.get(booking.hall_id)
            
            if booking.status == 'confirmed':
                subject = 'Booking Confirmation - Nadsathira Mahal'
                html_body = render_template('email/confirmation.html', 
                                          user_name=user.username,
                                          hall_name=hall.name,
                                          event_date=booking.event_date,
                                          start_time=booking.start_time.strftime('%H:%M'),
                                          end_time=booking.end_time.strftime('%H:%M'),
                                          guests=booking.guests)
            else:
                subject = 'Booking Status Update - Nadsathira Mahal'
                html_body = render_template('email/rejection.html',
                                          user_name=user.username,
                                          hall_name=hall.name,
                                          event_date=booking.event_date)
                
            msg = Message(subject, recipients=[user.email])
            msg.html = html_body
            mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")
    
    return jsonify({
        'message': f'Booking {data["status"]} successfully',
        'booking': booking.to_dict()
    }), 200

# Staff Routes
@bp.route('/api/staff/list', methods=['GET'])
@admin_required
def get_staff_list(current_user):
    """Admin-only endpoint to get list of all staff"""
    staff = User.query.filter_by(role='staff').all()
    return jsonify([s.to_dict() for s in staff]), 200

@bp.route('/api/assignments', methods=['POST'])
@admin_required
def create_assignment(current_user):
    """Admin-only endpoint to assign staff to a booking"""
    data = request.get_json()
    if not data or not data.get('booking_id') or not data.get('staff_id'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_assignment = StaffAssignment(
        booking_id=data['booking_id'],
        user_id=data['staff_id'],
        task=data.get('task', 'General Assistance'),
        status='assigned'
    )
    db.session.add(new_assignment)
    db.session.commit()
    return jsonify({'message': 'Staff assigned successfully'}), 201

@bp.route('/api/assignments', methods=['GET'])
@admin_required
def get_all_assignments(current_user):
    """Admin-only endpoint to list all assignments"""
    assignments = StaffAssignment.query.all()
    # Join with User/Hall info if needed, or rely on to_dict() if it handles relationships
    return jsonify([a.to_dict() for a in assignments]), 200

@bp.route('/api/staff/assignments', methods=['GET'])
@staff_required
def get_staff_assignments(current_user):
    """Staff endpoint to see their own assignments"""
    assignments = StaffAssignment.query.filter_by(user_id=current_user.id).all()
    return jsonify([a.to_dict() for a in assignments]), 200

@bp.route('/api/assignments/<int:assignment_id>/status', methods=['PUT'])
@staff_required
def update_assignment_status(current_user, assignment_id):
    """Staff endpoint to update task status"""
    data = request.get_json()
    assignment = StaffAssignment.query.get(assignment_id)
    
    if not assignment or assignment.user_id != current_user.id:
        return jsonify({'error': 'Assignment not found'}), 404
        
    if 'status' in data:
        assignment.status = data['status']
        db.session.commit()
        
    return jsonify({'message': 'Status updated'}), 200

@bp.route('/api/admin/feedback', methods=['GET'])
@admin_required
def get_all_feedback(current_user):
    """Admin-only endpoint to get all feedback"""
    # Outer left join to include general feedback (where booking/hall is null)
    feedbacks = db.session.query(Feedback, Booking, User, Hall)\
        .outerjoin(Booking, Feedback.booking_id == Booking.id)\
        .join(User, Feedback.user_id == User.id)\
        .outerjoin(Hall, Booking.hall_id == Hall.id)\
        .order_by(Feedback.created_at.desc())\
        .all()
    
    results = []
    for f, b, u, h in feedbacks:
        results.append({
            'id': f.id,
            'rating': f.rating,
            'comments': f.comments,
            'created_at': f.created_at.isoformat(),
            'user_name': u.username,
            'user_email': u.email,
            'hall_name': h.name if h else 'General Feedback',
            'event_date': b.event_date.isoformat() if b else 'N/A'
        })
    
    return jsonify(results), 200


@bp.route('/api/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    data = request.get_json()
    if not data or not data.get('rating'):
        return jsonify({'error': 'Rating is required'}), 400

    booking_id = data.get('booking_id')
    
    # If booking_id is provided, validate it
    if booking_id:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
            
        if booking.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Check if feedback already exists for this booking
        existing = Feedback.query.filter_by(booking_id=booking.id).first()
        if existing:
            return jsonify({'error': 'Feedback already submitted for this booking'}), 400
    
    feedback = Feedback(
        booking_id=booking_id, # Can be None
        user_id=current_user.id,
        rating=data['rating'],
        comments=data.get('comments', '')
    )
    db.session.add(feedback)
    db.session.commit()
    
    return jsonify({'message': 'Feedback submitted successfully'}), 201

@bp.route('/api/debug/seed', methods=['GET'])
def seed_db():
    try:
        if Hall.query.count() > 0:
            return jsonify({'message': 'Halls already exist'}), 200
            
        halls = [
            Hall(
                name="Grand Ballroom",
                capacity=500,
                price_per_day=150000,
                price_morning=80000,
                price_evening=120000,
                location="Main Floor",
                description="Our largest venue, perfect for weddings and grand receptions. Features crystal chandeliers.",
                image_url="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Sapphire Hall",
                capacity=200,
                price_per_day=80000,
                price_morning=45000,
                price_evening=65000,
                location="First Floor",
                description="An elegant space for intimate gatherings, birthday parties, and corporate events.",
                image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc6?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Jade Garden",
                capacity=150,
                price_per_day=60000,
                price_morning=35000,
                price_evening=50000,
                location="Outdoor / Garden",
                description="A beautiful open-air venue surrounded by lush greenery. Ideal for evening parties.",
                image_url="https://images.unsplash.com/photo-1533169461206-c8f376d8b31d?auto=format&fit=crop&q=80&w=800"
            )
        ]
        
        for h in halls:
            db.session.add(h)
        db.session.commit()
        
        return jsonify({'message': 'Seeded 3 halls successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

