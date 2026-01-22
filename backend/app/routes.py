from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Hall, Booking
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

bp = Blueprint('api', __name__)

@bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password, role=data.get('role', 'customer'))
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/api/halls', methods=['GET'])
def get_halls():
    halls = Hall.query.all()
    return jsonify([hall.to_dict() for hall in halls]), 200

@bp.route('/api/halls', methods=['POST'])
def add_hall():
    # In a real app, add @login_required and check for admin role
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

@bp.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    # Check if hall is available
    event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
    existing_booking = Booking.query.filter_by(hall_id=data['hall_id'], event_date=event_date).first()
    
    if existing_booking:
        return jsonify({'error': 'Hall is already booked for this date'}), 400
    
    new_booking = Booking(
        user_id=data['user_id'],
        hall_id=data['hall_id'],
        event_date=event_date
    )
    db.session.add(new_booking)
    db.session.commit()
    return jsonify({'message': 'Booking request submitted', 'booking': new_booking.to_dict()}), 201

@bp.route('/api/bookings', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    return jsonify([booking.to_dict() for booking in bookings]), 200
