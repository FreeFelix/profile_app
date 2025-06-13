from faker import Faker
from app import app, db
from models import User, Follow
from werkzeug.security import generate_password_hash
from random import choice, randint, sample

fake = Faker()

def seed_users(n=20):
    users = []
    for _ in range(n):
        user = User(
            name=fake.name(),
            email=fake.unique.email(),
            password_hash=generate_password_hash("test123"),
            bio=fake.text(max_nb_chars=200),
            location=fake.city(),
            website=fake.url(),
            date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=60),
            career=fake.job(),
            profile_image="default.png",
            linkedin=fake.url(),
            github=fake.url(),
            twitter=fake.url(),
            is_private=choice([True, False]),
            theme_pref=choice(["light", "dark"]),
            is_admin=False,
        )
        db.session.add(user)
        users.append(user)
    db.session.commit()
    return users

def seed_follows(users, max_follows_per_user=5):
    user_ids = [user.id for user in users]
    for user in users:
        possible_ids = [uid for uid in user_ids if uid != user.id]
        follows = sample(possible_ids, k=randint(1, min(max_follows_per_user, len(possible_ids))))
        for followed_id in follows:
            # Do NOT set id here!
            follow = Follow(
                follower_id=user.id,
                followed_id=followed_id
            )
            db.session.add(follow)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        users = seed_users(20)
        seed_follows(users)
        print("Database seeded with fake users and follows.")