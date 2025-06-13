from flask import Flask
from models import db
from auth import auth_bp
from profile import profile_bp
from config import Config
from api.v1 import v1_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(v1_bp)

    @app.route('/')
    def index():
        return "Welcome to your Flask app!"

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)