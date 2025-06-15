from flask import Flask
from models import db
from auth import auth_bp
from profile_1 import profile_bp
from config import Config
from api.v1 import v1_bp
from flask_cors import CORS
from flask import send_from_directory
from flask_migrate import Migrate  # <-- Add this import
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    migrate = Migrate(app, db)  # <-- Add this line

    with app.app_context():
        db.create_all()

    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(v1_bp)

    @app.route('/')
    def index():
        return "Welcome to your Flask app!"

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)