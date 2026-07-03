# app/main.py

# --- IMPORTS ---
# FastAPI: The web framework. Handles HTTP requests and responses.
from fastapi import FastAPI, HTTPException, status
# List: Type hint for returning lists of todos.
from typing import List
# JSON: Used for structured logging (Observability).
import json
# datetime: Adds timestamps to logs.
from datetime import datetime
# logging: Python's built-in logging library.
import logging
# BaseModel: For request/response validation.
from .models import TodoCreate, TodoResponse

# --- CONCEPT 7: OBSERVABILITY (Structured Logging) ---
# Why: Plain text logs are hard to search. JSON logs are machine-readable.
# How: We create a custom formatter that converts log records to JSON.

class JSONFormatter(logging.Formatter):
    def format(self, record):
        # Create a dictionary with all the log details
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),  # UTC timestamp
            "level": record.levelname,                   # INFO, ERROR, etc.
            "message": record.getMessage(),              # The actual log message
            "module": record.module                      # Which file logged this
        }
        # Convert dictionary to JSON string and return it
        return json.dumps(log_entry)

# Create a logger instance
logger = logging.getLogger("todo-api")
# Create a handler that outputs to the console (stdout)
handler = logging.StreamHandler()
# Attach our JSON formatter to the handler
handler.setFormatter(JSONFormatter())
# Add the handler to our logger
logger.addHandler(handler)
# Set the log level to INFO (shows INFO, WARNING, ERROR, CRITICAL)
logger.setLevel(logging.INFO)

# --- CONCEPT 6: MONITORING (Health Check) ---
# Why: External systems (like Render) ping this endpoint to check if our app is alive.
# How: A simple endpoint that always returns {"status": "ok"}.

# Initialize the FastAPI application
app = FastAPI(
    title="Simple To-Do API",
    description="A basic to-do list with full DevOps pipeline",
    version="1.0.0"
)

# In-memory database (simulated). 
# In production, we would use a real database like PostgreSQL.
# For this demo, all data is lost when the server restarts.
todos_db = []  # List to store our todos
todo_id_counter = 1  # Auto-incrementing ID counter

# --- MONITORING: Health Check Endpoint ---
# @app.get("/health") means: When someone visits /health using GET method,
# execute this function.
@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring.
    Returns a simple JSON response indicating the service is running.
    """
    logger.info("Health check endpoint called")
    return {"status": "ok", "service": "todo-api"}

# --- MONITORING: Root Endpoint ---
@app.get("/")
def root():
    """
    Root endpoint showing API information.
    """
    logger.info("Root endpoint accessed")
    return {
        "message": "To-Do API is running!",
        "docs": "/docs",  # FastAPI automatically generates interactive docs
        "health": "/health"
    }

# --- BUSINESS LOGIC: Create a new To-Do ---
# @app.post("/todos/") means: When someone POSTs to /todos/, run this.
# status_code=status.HTTP_201_CREATED means: Return 201 (Created) on success.
@app.post("/todos/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate):
    """
    Create a new todo item.
    
    Args:
        todo: The todo data from the request body (validated by TodoCreate model)
    
    Returns:
        The created todo with an ID assigned.
    """
    global todo_id_counter
    logger.info(f"Attempting to create todo: {todo.title}")
    
    # Create a new todo dictionary
    new_todo = {
        "id": todo_id_counter,
        "title": todo.title,
        "description": todo.description,
        "completed": False
    }
    
    # Add to our in-memory database
    todos_db.append(new_todo)
    logger.info(f"Todo created with ID: {todo_id_counter}")
    
    # Increment the counter for the next todo
    todo_id_counter += 1
    
    # Return the created todo (FastAPI automatically converts dict to JSON)
    return new_todo

# --- BUSINESS LOGIC: Get all To-Dos ---
@app.get("/todos/", response_model=List[TodoResponse])
def list_todos():
    """
    Get all todos.
    
    Returns:
        A list of all todos in the database.
    """
    logger.info(f"Fetching all todos. Total count: {len(todos_db)}")
    return todos_db

# --- BUSINESS LOGIC: Get a single To-Do by ID ---
@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int):
    """
    Get a specific todo by its ID.
    
    Args:
        todo_id: The ID of the todo to retrieve.
    
    Returns:
        The todo if found, otherwise raises a 404 error.
    """
    logger.info(f"Fetching todo with ID: {todo_id}")
    
    # Search for the todo in our database
    for todo in todos_db:
        if todo["id"] == todo_id:
            logger.info(f"Todo found: {todo['title']}")
            return todo
    
    # If we reach here, the todo wasn't found
    logger.error(f"Todo with ID {todo_id} not found")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Todo with ID {todo_id} not found"
    )

# --- BUSINESS LOGIC: Update a To-Do ---
@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_update: TodoCreate):
    """
    Update a todo completely.
    
    Args:
        todo_id: The ID of the todo to update.
        todo_update: The new data for the todo.
    
    Returns:
        The updated todo.
    """
    logger.info(f"Attempting to update todo ID: {todo_id}")
    
    # Find the todo
    for i, todo in enumerate(todos_db):
        if todo["id"] == todo_id:
            # Update the fields
            todos_db[i]["title"] = todo_update.title
            todos_db[i]["description"] = todo_update.description
            logger.info(f"Todo {todo_id} updated successfully")
            return todos_db[i]
    
    # If not found, raise 404
    logger.error(f"Todo with ID {todo_id} not found for update")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Todo with ID {todo_id} not found"
    )

# --- BUSINESS LOGIC: Delete a To-Do ---
@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int):
    """
    Delete a todo by its ID.
    
    Args:
        todo_id: The ID of the todo to delete.
    
    Returns:
        204 No Content on success.
    """
    logger.warning(f"Attempting to delete todo ID: {todo_id}")
    
    # Find and remove the todo
    for i, todo in enumerate(todos_db):
        if todo["id"] == todo_id:
            deleted = todos_db.pop(i)
            logger.warning(f"Todo {todo_id} deleted: {deleted['title']}")
            return  # Returns HTTP 204 No Content
    
    # If not found, raise 404
    logger.error(f"Todo with ID {todo_id} not found for deletion")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Todo with ID {todo_id} not found"
    )