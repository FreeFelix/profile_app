from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from models import db, User, Follow, Activity, Post
from auth import token_required
from config import Config
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

def parse_bool(val):
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.lower() in ['true', '1', 'yes']
    return False

@profile_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Get recent activities (limit to 10, newest first)
    activities = Activity.query.filter_by(user_id=current_user.id).order_by(Activity.timestamp.desc()).limit(10).all()
    activities_data = [a.to_dict() for a in activities]

    user_data = current_user.to_dict()
    user_data["activities"] = activities_data

    return jsonify(user_data)

@profile_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    # Accept both JSON and form data for flexibility
    if request.content_type and request.content_type.startswith('application/json'):
        data = request.get_json()
        files = {}
    else:
        data = request.form
        files = request.files

    # Debug: print incoming data
    print("Received data:", data)
    print("Received files:", files)

    # Ensure upload folder exists
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)

    # Handle profile image upload
    if 'profile_image' in files:
        file = files['profile_image']
        if file and file.filename:
            filename = secure_filename(file.filename)
            file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
            current_user.profile_image = filename

    # Update fields if present in data
    for field in [
        'name', 'bio', 'location', 'website', 'career',
        'linkedin', 'github', 'twitter', 'theme_pref'
    ]:
        if field in data:
            setattr(current_user, field, data.get(field))

    # Handle boolean and date fields
    if 'is_private' in data:
        current_user.is_private = parse_bool(data.get('is_private'))

    if 'date_of_birth' in data and data.get('date_of_birth'):
        try:
            current_user.date_of_birth = datetime.strptime(data.get('date_of_birth'), "%Y-%m-%d")
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    try:
        db.session.commit()
        # Log activity
        activity = Activity(
            user_id=current_user.id,
            type="profile_update",
            description="Profile updated"
        )
        db.session.add(activity)
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        db.session.rollback()
        print("DB commit error:", e)
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
@token_required
def view_profile(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.is_private and user.id != current_user.id:
        return jsonify({"message": "This profile is private."}), 403
    data = user.to_dict()
    # Optionally include activities for viewed user
    activities = Activity.query.filter_by(user_id=user.id).order_by(Activity.timestamp.desc()).limit(10).all()
    data["activities"] = [a.to_dict() for a in activities]
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
    # Log activity
    activity = Activity(
        user_id=current_user.id,
        type="follow",
        description=f"Started following user {user_id}"
    )
    db.session.add(activity)
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

@profile_bp.route('/admin/all_follows', methods=['GET'])
@token_required
def get_all_follows(current_user):
    if not current_user.is_admin:
        return jsonify({"message": "Admin access required"}), 403
    follows = Follow.query.all()
    return jsonify([follow.to_dict() for follow in follows])