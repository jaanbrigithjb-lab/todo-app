# tests/test_main.py
from fastapi.testclient import TestClient
from app.main import app

# Concept: TestClient simulates HTTP requests to our app.
client = TestClient(app)

def test_root():
    """Test that the root endpoint returns the expected message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health():
    """Test that the health check endpoint works."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_create_todo():
    """Test that we can create a todo successfully."""
    response = client.post("/todos/", json={"title": "Test Todo", "description": "Test description"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["id"] is not None

def test_list_todos():
    """Test that we can list all todos."""
    # First, create a todo
    client.post("/todos/", json={"title": "List Test"})
    # Then, list all todos
    response = client.get("/todos/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_get_nonexistent_todo():
    """Test that getting a non-existent todo returns 404."""
    response = client.get("/todos/99999")
    assert response.status_code == 404