import os
from pathlib import Path
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from PIL import Image, ImageOps
import base64, cv2, numpy as np, json, uuid, mimetypes, hashlib

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Production Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/mala_restaurant_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    
    # Upload configuration
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', './uploads')
    
    # CORS configuration
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, origins=[frontend_url])
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    for subdir in ['products', 'qr_codes', 'slips']:
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], subdir), exist_ok=True)
    
    return app

app = create_app()

# Database setup
db = SQLAlchemy(app)

# Helper function for absolute URLs
def abs_url_for(endpoint, **values):
    rel = url_for(endpoint, **values)
    host = request.host_url.rstrip('/')
    return f"{host}{rel}"

# HEIC/HEIF support
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

# Load AI models with error handling
try:
    model_dir = Path(__file__).parent / 'models'
    product_model = YOLO(model_dir / 'best.pt')
    hand_model = YOLO(model_dir / 'hands.pt')
except Exception as e:
    print(f"Warning: Could not load AI models: {e}")
    product_model = None
    hand_model = None

# Database Models
class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    items = db.Column(JSONB)
    order_details = db.Column(JSONB)

class QRScan(db.Model):
    __tablename__ = 'qr_scans'
    
    id = db.Column(db.Integer, primary_key=True)
    qr_content = db.Column(db.Text, nullable=False)
    table_number = db.Column(db.Integer)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class PaymentSlip(db.Model):
    __tablename__ = 'payment_slips'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    upload_time = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    order = db.relationship('Order', backref=db.backref('payment_slips', lazy=True))

# Create tables
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")

# Import routes (this should be at the end)
if __name__ == '__main__':
    # Development server - don't use in production
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') != 'production'
    
    app.run(host=host, port=port, debug=debug)