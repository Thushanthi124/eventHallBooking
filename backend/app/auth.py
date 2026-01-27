from flask import jsonify, request, current_app
from functools import wraps
from itsdangerous import URLSafeTimedSerializer
from app.models import User

# Pivot: Using itsdangerous for token verification (Dependency-free JWT alternative)

def verify_token_in_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise Exception('Missing or invalid token')
    token = auth_header.split(" ")[1]
    
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        # Max age 1 day (86400 seconds)
        user_id = s.loads(token, salt='access-token', max_age=86400)
        return user_id
    except Exception:
        raise Exception('Invalid or expired token')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user_id = verify_token_in_request()
            current_user = User.query.get(user_id)
            if not current_user:
                 return jsonify({'error': 'User not found'}), 401
            return f(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user_id = verify_token_in_request()
            current_user = User.query.get(user_id)
            if not current_user:
                 return jsonify({'error': 'User not found'}), 401
            
            if current_user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
                
            return f(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated

def customer_or_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user_id = verify_token_in_request()
            current_user = User.query.get(user_id)
            if not current_user:
                 return jsonify({'error': 'User not found'}), 401
            
            return f(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated

def staff_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user_id = verify_token_in_request()
            current_user = User.query.get(user_id)
            if not current_user:
                 return jsonify({'error': 'User not found'}), 401
            
            if current_user.role != 'staff':
                return jsonify({'error': 'Staff access required'}), 403
                
            return f(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated
