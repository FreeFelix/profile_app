from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash, secure_filename
from models import db, User
import jwt
import os
from datetime import datetime, timedelta, UTC
from functools import wraps
from config import Config

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Accept token from Authorization header as Bearer <token>
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/signup', methods=['POST'])
def signup():
    # Accept form data for file upload
    data = request.form
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Name, email, and password required!'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    profile_image = None
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file.filename:
            # Ensure upload folder exists
            if not os.path.exists(Config.UPLOAD_FOLDER):
                os.makedirs(Config.UPLOAD_FOLDER)
            filename = secure_filename(file.filename)
            file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
            profile_image = filename
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        profile_image=profile_image
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required!'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Login failed!'}), 401
    token = jwt.encode(
        {'id': user.id, 'exp': datetime.now(UTC) + timedelta(hours=2)},
        Config.SECRET_KEY,
        algorithm="HS256"
    )
    return jsonify({'token': token})