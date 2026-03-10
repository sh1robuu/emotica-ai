import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Patch passlib bcrypt issue with newer bcrypt libraries
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = About

from main import app
from db.database import Base, get_db

# Use test SQLite database for isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Force check_same_thread=False ONLY for sqlite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = client.post("/api/auth/register", json=user_data)
    
    if response.status_code == 400:
        response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "testpassword"})
        
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
