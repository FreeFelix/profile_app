from flask import Blueprint, jsonify, request
from models import db, User, Follow
from auth import token_required

v1_bp = Blueprint('v1', __name__, url_prefix='/api/v1')

@v1_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify(current_user.to_dict())

@v1_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.form
    current_user.name = data.get('name', current_user.name)
    current_user.bio = data.get('bio', current_user.bio)
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': current_user.to_dict()})

@v1_bp.route('/profile/<int:user_id>', methods=['GET'])
@token_required
def get_user_profile(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@v1_bp.route('/follow/<int:user_id>', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    if user_id == current_user.id:
        return jsonify({'message': "You can't follow yourself"}), 400
    if not User.query.get(user_id):
        return jsonify({'message': 'User not found'}), 404
    if Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first():
        return jsonify({'message': 'Already following'}), 400
    follow = Follow(follower_id=current_user.id, followed_id=user_id)
    db.session.add(follow)
    db.session.commit()
    return jsonify({'message': 'Now following user'})

@v1_bp.route('/unfollow/<int:user_id>', methods=['DELETE'])
@token_required
def unfollow_user(current_user, user_id):
    follow = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
    if not follow:
        return jsonify({'message': 'Not following'}), 400
    db.session.delete(follow)
    db.session.commit()
    return jsonify({'message': 'Unfollowed user'})

@v1_bp.route('/admin/all_users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@v1_bp.route('/admin/all_follows', methods=['GET'])
@token_required
def get_all_follows(current_user):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    follows = Follow.query.all()
    return jsonify([follow.to_dict() for follow in follows])