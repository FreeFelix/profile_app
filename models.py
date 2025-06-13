from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, UTC

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    bio = db.Column(db.Text)
    location = db.Column(db.String(120))
    website = db.Column(db.String(255))
    date_of_birth = db.Column(db.Date)
    career = db.Column(db.String(120))
    profile_image = db.Column(db.String(255), default="default.png")
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    twitter = db.Column(db.String(255))
    is_private = db.Column(db.Boolean, default=False)
    theme_pref = db.Column(db.String(20), default="light")
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "bio": self.bio,
            "location": self.location,
            "website": self.website,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "career": self.career,
            "profile_image": self.profile_image,
            "linkedin": self.linkedin,
            "github": self.github,
            "twitter": self.twitter,
            "is_private": self.is_private,
            "theme_pref": self.theme_pref,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    def to_dict(self):
        return {
            "id": self.id,
            "follower_id": self.follower_id,
            "followed_id": self.followed_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }