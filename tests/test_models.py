from models import User, Follow

def test_user_model():
    user = User(
        name="Model User",
        email="model@example.com",
        password_hash="hashed"
    )
    assert user.name == "Model User"
    assert user.email == "model@example.com"

def test_follow_model():
    follow = Follow(
        follower_id=1,
        followed_id=2
    )
    assert follow.follower_id == 1
    assert follow.followed_id == 2