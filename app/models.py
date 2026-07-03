# app/models.py
from pydantic import BaseModel

# Concept: This is a "Data Contract". 
# It ensures that when a user sends us data, it has the correct shape.
class TodoCreate(BaseModel):
    title: str  # Required field. Must be a string.
    description: str = ""  # Optional field. Defaults to empty string.

class TodoResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool = False