"""Test fixtures.

The suite runs against a real PostgreSQL, because the models use JSONB and the
catalog round-trip is precisely what is worth testing. Point TEST_DATABASE_URL
at a throwaway database; `docker compose up db` is enough.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    os.environ.get("DATABASE_URL", "postgresql+psycopg://pianonobil:pianonobil@localhost:5432/pianonobil_test"),
)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("SEED_ON_STARTUP", "0")

from app import models  # noqa: E402
from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

engine = create_engine(TEST_DATABASE_URL, future=True)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@pytest.fixture(scope="session", autouse=True)
def database():
    """A schema created from the models, seeded once for the whole session."""
    models.Base.metadata.drop_all(engine)
    models.Base.metadata.create_all(engine)
    with TestingSession() as db:
        seed(db, force=True)
    yield
    models.Base.metadata.drop_all(engine)


@pytest.fixture
def db():
    with TestingSession() as session:
        yield session


@pytest.fixture
def client(database):
    def override():
        with TestingSession() as session:
            yield session

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
