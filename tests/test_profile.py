import pytest
from app import app, db
from models import User
from werkzeug.security import generate_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            user = User(
                name="Profile User",
                email="profile@example.com",
                password_hash=generate_password_hash("test123")
            )
            db.session.add(user)
            db.session.commit()
        yield client

def test_get_profile_unauthorized(client):
    response = client.get('/profile')
    assert response.status_code == 401

# Add more tests for authorized access and updates as needed