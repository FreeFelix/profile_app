from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from models import db, User, Follow
from auth import token_required
from config import Config
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    user_data = {
        "name": current_user.name,
        "email": current_user.email,
        "bio": current_user.bio,
        "location": current_user.location,
        "website": current_user.website,
        "date_of_birth": current_user.date_of_birth.isoformat() if current_user.date_of_birth else None,
        "career": current_user.career,
        "linkedin": current_user.linkedin,
        "github": current_user.github,
        "twitter": current_user.twitter,
        "is_private": current_user.is_private,
        "theme_pref": current_user.theme_pref,
        "profile_image": current_user.profile_image
    }
    return jsonify(user_data)

@profile_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.form
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        filename = secure_filename(file.filename)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        current_user.profile_image = file_path
    current_user.name = data.get('name', current_user.name)
    current_user.bio = data.get('bio', current_user.bio)
    current_user.location = data.get('location', current_user.location)
    current_user.website = data.get('website', current_user.website)
    current_user.career = data.get('career', current_user.career)
    current_user.linkedin = data.get('linkedin', current_user.linkedin)
    current_user.github = data.get('github', current_user.github)
    current_user.twitter = data.get('twitter', current_user.twitter)
    current_user.theme_pref = data.get('theme_pref', current_user.theme_pref)
    current_user.is_private = data.get('is_private', str(current_user.is_private)).lower() == 'true'
    if 'date_of_birth' in data:
        current_user.date_of_birth = datetime.strptime(data['date_of_birth'], "%Y-%m-%d")
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
@token_required
def view_profile(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.is_private and user.id != current_user.id:
        return jsonify({"message": "This profile is private."}), 403
    data = {
        "name": user.name,
        "bio": user.bio,
        "career": user.career,
        "linkedin": user.linkedin,
        "github": user.github,
        "twitter": user.twitter,
        "theme_pref": user.theme_pref,
        "profile_image": user.profile_image
    }
    return jsonify(data)

@profile_bp.route('/follow/<int:user_id>', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    if user_id == current_user.id:
        return jsonify({"message": "You can't follow yourself."}), 400
    exists = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
    if exists:
        return jsonify({"message": "Already following."}), 400
    db.session.add(Follow(follower_id=current_user.id, followed_id=user_id))
    db.session.commit()
    return jsonify({"message": "User followed."})

@profile_bp.route('/unfollow/<int:user_id>', methods=['DELETE'])
@token_required
def unfollow_user(current_user, user_id):
    follow = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
    if not follow:
        return jsonify({"message": "Not following this user."}), 404
    db.session.delete(follow)
    db.session.commit()
    return jsonify({"message": "Unfollowed."})

@profile_bp.route('/admin/users', methods=['GET'])
@token_required
def list_users(current_user):
    if not current_user.is_admin:
        return jsonify({"message": "Admins only."}), 403
    users = User.query.all()
    result = [{"id": u.id, "email": u.email, "is_admin": u.is_admin} for u in users]
    return jsonify(result)

@profile_bp.route('/admin/all_users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if not current_user.is_admin:
        return jsonify({"message": "Admin access required"}), 403
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@profile_bp.route('/admin/all_follows', methods=['GET'])
@token_required
def get_all_follows(current_user):
    if not current_user.is_admin:
        return jsonify({"message": "Admin access required"}), 403
    follows = Follow.query.all()
    return jsonify([follow.to_dict() for follow in follows])