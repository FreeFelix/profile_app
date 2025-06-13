from app import app, db
from models import User

with app.app_context():
    user = User.query.filter_by(email="soc@example.com").first()
    if user:
        user.is_admin = True
        db.session.commit()
        print("User is now admin.")
    else:
        print("User not found.")