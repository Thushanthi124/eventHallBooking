from app import db
from datetime import datetime

from sqlalchemy import func

def get_next_id(model, prefix):
    """
    Generates the next ID for a model with a given prefix (e.g., C01, C02).
    """
    # Sort by length first to handle C1 - C10 correct ordering
    last = model.query.filter(model.id.like(f'{prefix}%')) \
                 .order_by(func.length(model.id).desc(), model.id.desc()) \
                 .first()
    
    if not last:
        return f'{prefix}01'
    
    try:
        # Extract number part (everything after prefix)
        num_str = last.id[len(prefix):]
        num = int(num_str)
        return f'{prefix}{num + 1:02d}'
    except ValueError:
        # Fallback if ID format is unexpected
        return f'{prefix}01'

class User(db.Model):
    """
    Represents a system user.
    Roles specify the access level (e.g., 'customer', 'admin', 'staff').
    """
    __tablename__ = 'users'
    id = db.Column(db.String(20), primary_key=True)
    username = db.Column(db.String(64), index=True, unique=False, nullable=False)
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.id:
            role = kwargs.get('role', 'customer')
            prefix = 'C'
            if role == 'admin':
                prefix = 'A'
            elif role == 'staff':
                prefix = 'S'
            self.id = get_next_id(User, prefix)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('customer', 'admin', 'staff'), default='customer')
    staff_type = db.Column(db.Enum('kitchen', 'cleaning', 'waiter', 'none'), default='none')
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)
    is_approved = db.Column(db.Boolean, default=True) # Defaults to True for customers, blocked for staff manually
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', backref='user', lazy=True)


    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'staff_type': self.staff_type,
            'is_verified': self.is_verified,
            'is_approved': self.is_approved
        }



class Hall(db.Model):
    """
    Represents an event hall that can be booked.
    Stores attributes like capacity, base price, and location.
    """
    __tablename__ = 'halls'
    id = db.Column(db.String(20), primary_key=True)
    
    def __init__(self, **kwargs):
        super(Hall, self).__init__(**kwargs)
        if not self.id:
            self.id = get_next_id(Hall, 'H')
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price_per_day = db.Column(db.Numeric(10, 2), nullable=False)
    price_morning = db.Column(db.Numeric(10, 2), default=0)
    price_evening = db.Column(db.Numeric(10, 2), default=0)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Link to HallOwner (Made nullable for now to support existing halls)
    owner_id = db.Column(db.Integer, db.ForeignKey('hall_owners.owner_id'), nullable=True)
    
    bookings = db.relationship('Booking', backref='hall', lazy=True)
    # Relationship to owner
    owner = db.relationship('HallOwner', backref='halls')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,
            'price_per_day': float(self.price_per_day),
            'price_morning': float(self.price_morning or 0),
            'price_evening': float(self.price_evening or 0),
            'location': self.location,
            'description': self.description,
            'image_url': self.image_url,
            'owner_id': self.owner_id,
            'owner_name': self.owner.name if self.owner else None
        }

class HallOwner(db.Model):
    """
    Represents the owner of one or more halls.
    """
    __tablename__ = 'hall_owners'
    owner_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'owner_id': self.owner_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FoodPackage(db.Model):
    __tablename__ = 'food_packages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    price_per_head = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    items = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price_per_head': float(self.price_per_head),
            'description': self.description,
            'items': self.items
        }

class Booking(db.Model):
    """
    Represents a reservation made by a user for a specific hall.
    It tracks dates, times, guest counts, and payment/booking statuses.
    """
    __tablename__ = 'bookings'
    id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    hall_id = db.Column(db.String(20), db.ForeignKey('halls.id'), nullable=False)
    
    def __init__(self, **kwargs):
        super(Booking, self).__init__(**kwargs)
        if not self.id:
            self.id = get_next_id(Booking, 'B')
    event_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    phone = db.Column(db.String(20))
    guests = db.Column(db.Integer, default=50)
    food_package_id = db.Column(db.Integer, db.ForeignKey('food_packages.id'))
    custom_preferences = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'confirmed', 'rejected', 'cancelled'), default='pending')
    total_price = db.Column(db.Numeric(12, 2), default=0)
    paid_amount = db.Column(db.Numeric(12, 2), default=0)
    payment_status = db.Column(db.Enum('pending', 'paid', 'failed', 'refunded', 'partial', 'non-refundable'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='booking', lazy=True)
    feedback = db.relationship('Feedback', backref='booking', uselist=False, lazy=True)
    assignments = db.relationship('StaffAssignment', backref='booking', lazy=True)
    food_package_rel = db.relationship('FoodPackage', backref='bookings')

    def to_dict(self):
        total = float(self.total_price or 0)
        paid = float(self.paid_amount or 0)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else "Unknown",
            'hall_id': self.hall_id,
            'hall_name': self.hall.name if self.hall else f"Hall #{self.hall_id}",
            'hall_price': float(self.hall.price_per_day) if self.hall else 0,
            'event_date': self.event_date.isoformat(),
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'phone': self.phone,
            'guests': self.guests,
            'food_package': self.food_package_rel.name if self.food_package_rel else None,
            'custom_preferences': self.custom_preferences,
            'status': self.status,
            'total_price': total,
            'paid_amount': paid,
            'balance_due': total - paid,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat(),
            'feedback': self.feedback.to_dict() if self.feedback else None
        }

class Payment(db.Model):
    """
    Stores payment transactions related to a booking.
    """
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), default='credit_card')
    status = db.Column(db.Enum('success', 'failed'), default='success')

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': float(self.amount),
            'payment_date': self.payment_date.isoformat(),
            'status': self.status
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.id'), nullable=True)
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer)
    comments = db.Column(db.Text)
    admin_response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comments': self.comments,
            'admin_response': self.admin_response,
            'created_at': self.created_at.isoformat()
        }

class StaffAssignment(db.Model):
    """
    Maps staff users to specific bookings for tasks (e.g., cleaning, catering).
    """
    __tablename__ = 'staff_assignments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.id'), nullable=False)
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    task = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('assigned', 'in_progress', 'completed'), default='assigned')
    pay_rate = db.Column(db.Numeric(10, 2), default=3000.00)
    payment_status = db.Column(db.Enum('pending', 'paid'), default='pending')
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    assignee = db.relationship('User', backref='task_assignments')

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'staff_name': self.assignee.username if self.assignee else "Unknown",
            'staff_email': self.assignee.email if self.assignee else "",
            'staff_type': self.assignee.staff_type if self.assignee else "staff",
            'hall_name': self.booking.hall.name if self.booking and self.booking.hall else "Unknown",
            'event_date': self.booking.event_date.isoformat() if self.booking else None,
            'start_time': self.booking.start_time.strftime('%H:%M') if self.booking and self.booking.start_time else None,
            'end_time': self.booking.end_time.strftime('%H:%M') if self.booking and self.booking.end_time else None,
            'guests': self.booking.guests if self.booking else 0,
            'food_package': self.booking.food_package_rel.name if self.booking and self.booking.food_package_rel else None,
            'custom_preferences': self.booking.custom_preferences if self.booking else None,
            'task': self.task,
            'status': self.status,
            'pay_rate': float(self.pay_rate or 3000.0),
            'payment_status': self.payment_status,
            'assigned_at': self.assigned_at.isoformat()
        }

class StaffLeave(db.Model):
    """
    Tracks staff availability. Staff can mark dates they are on leave.
    """
    __tablename__ = 'staff_leaves'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    leave_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    staff = db.relationship('User', backref='leaves')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'leave_date': self.leave_date.isoformat(),
            'reason': self.reason,
            'created_at': self.created_at.isoformat()
        }


class Notification(db.Model):
    """
    Represents a message sent to a user (e.g., from an admin).
    """
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipient = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'booking_id': self.booking_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }
