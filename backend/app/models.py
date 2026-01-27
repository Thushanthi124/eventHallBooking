from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('customer', 'admin', 'staff'), default='customer')
    staff_type = db.Column(db.Enum('kitchen', 'cleaning', 'waiter', 'none'), default='none')
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', backref='user', lazy=True)


    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'staff_type': self.staff_type,
            'is_verified': self.is_verified
        }



class Hall(db.Model):
    __tablename__ = 'halls'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price_per_day = db.Column(db.Numeric(10, 2), nullable=False)
    price_morning = db.Column(db.Numeric(10, 2), default=0)
    price_evening = db.Column(db.Numeric(10, 2), default=0)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', backref='hall', lazy=True)

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
            'image_url': self.image_url
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hall_id = db.Column(db.Integer, db.ForeignKey('halls.id'), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    phone = db.Column(db.String(20))
    guests = db.Column(db.Integer, default=50)
    food_package = db.Column(db.String(50), default='standard')
    custom_preferences = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'confirmed', 'rejected'), default='pending')
    total_price = db.Column(db.Numeric(12, 2), default=0)
    paid_amount = db.Column(db.Numeric(12, 2), default=0)
    payment_status = db.Column(db.Enum('pending', 'paid', 'failed', 'refunded', 'partial'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='booking', lazy=True)
    feedback = db.relationship('Feedback', backref='booking', uselist=False, lazy=True)
    assignments = db.relationship('StaffAssignment', backref='booking', lazy=True)

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
            'food_package': self.food_package,
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
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
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
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer)
    comments = db.Column(db.Text)
    admin_response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'rating': self.rating,
            'comments': self.comments,
            'admin_response': self.admin_response,
            'created_at': self.created_at.isoformat()
        }

class StaffAssignment(db.Model):
    __tablename__ = 'staff_assignments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('assigned', 'in_progress', 'completed'), default='assigned')
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
            'food_package': self.booking.food_package if self.booking else None,
            'custom_preferences': self.booking.custom_preferences if self.booking else None,
            'task': self.task,
            'status': self.status,
            'assigned_at': self.assigned_at.isoformat()
        }
