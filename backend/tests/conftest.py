import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_propvalue.db"

from app.core.database import Base, get_db
from app.main import app
from app.services.db_init import init_db

TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_propvalue.db"
test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    init_db(db)
    yield
    db.close()
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_propvalue.db"):
        try:
            os.remove("./test_propvalue.db")
        except Exception:
            pass

@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
