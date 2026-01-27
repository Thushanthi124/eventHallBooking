from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from config import Config
# from flask_jwt_extended import JWTManager (Removed due to install issues)

db = SQLAlchemy()
mail = Mail()
# jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # JWT Configuration (Removed)
    # app.config['JWT_SECRET_KEY'] = config_class.SECRET_KEY 
    # app.config['JWT_TOKEN_LOCATION'] = ['headers']

    CORS(app)
    db.init_app(app)
    mail.init_app(app)
    # jwt.init_app(app)

    from app import routes, models
    app.register_blueprint(routes.bp)

    return app
