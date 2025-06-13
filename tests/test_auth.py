import pytest
from app import app, db
from models import User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
        yield client

def test_signup(client):
    response = client.post('/signup', json={
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "test123"
    })
    assert response.status_code == 201

def test_login(client):
    # First, create a user
    client.post('/signup', json={
        "name": "Test User",
        "email": "testlogin@example.com",
        "password": "test123"
    })
    # Now, login
    response = client.post('/login', json={
        "email": "testlogin@example.com",
        "password": "test123"
    })
    assert response.status_code == 200
    assert 'token' in response.get_json()