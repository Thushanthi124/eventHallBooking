from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('customer', 'admin'), default='customer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Hall(db.Model):
    __tablename__ = 'halls'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price_per_day = db.Column(db.Numeric(10, 2), nullable=False)
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
    status = db.Column(db.Enum('pending', 'confirmed', 'rejected'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'hall_id': self.hall_id,
            'event_date': self.event_date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
