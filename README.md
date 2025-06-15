# profile_app

![Landing page](./public/landlingpage.png)

A Flask-based REST API for user profiles, authentication, and social features.

## Features

- **User Authentication**
  - Signup with name, email, and password
  - Login with JWT token authentication

- **Profile Management**
  - View your own profile
  - Update profile details (name, bio, location, website, career, social links, profile image, etc.)
  - View other users' profiles (with privacy controls)
![Discover page](./public/diskcoverpage.png)

- **Social Features**
  - Follow and unfollow users
  - Privacy setting for profiles

- **Admin Endpoints**
  - List all users (admin only)
  - List all follow relationships (admin only)

## API Documentation

See [api/swagger.yml](api/swagger.yml) for full OpenAPI documentation.

## Setup

1. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

2. **Initialize the database:**
   ```sh
   python
   >>> from app import app, db
   >>> with app.app_context():
   ...     db.create_all()
   ```

3. **Seed the database (optional):**
   ```sh
   python seed.py
   ```

4. **Run the app:**
   ```sh
   python app.py
   ```

## Running Tests

```sh
pytest
```

## Project Structure

- `app.py` - Main Flask app factory and entry point
- `models.py` - SQLAlchemy models for User and Follow
- `auth.py` - Authentication routes and JWT logic
- `profile.py` - Profile and social routes
- `api/v1.py` - Versioned API endpoints
- `config.py` - App configuration
- `seed.py` - Script to seed the database with fake data
- `make_admin.py` - Script to promote a user to admin
- `uploads/` - Folder for uploaded profile images
- `instance/app.db` - SQLite database file
- `tests/` - Unit tests

## Environment Variables

Edit `config.py` to set your `SECRET_KEY` and other settings.

---

For more details, see the code and [api/swagger.yml](api/swagger.yml).