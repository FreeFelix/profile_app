import os

class Config:
    SECRET_KEY = 'your-secret-key'
    # Use absolute path for SQLite DB in the instance folder
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASEDIR, 'instance', 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASEDIR, 'uploads')