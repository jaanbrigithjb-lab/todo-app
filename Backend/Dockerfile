# Dockerfile
# Line-by-Line Explanation:

# FROM: Specifies the base image to use.
# python:3.10-slim is a lightweight Linux image with Python 3.10 pre-installed.
FROM python:3.10-slim

# WORKDIR: Sets the working directory inside the container.
# All subsequent commands will run from this directory.
# /app is a standard convention for application code.
WORKDIR /app

# COPY: Copies files from your computer into the container.
# First argument: Source (on your computer)
# Second argument: Destination (inside the container)
# Here, we copy requirements.txt first to leverage Docker's layer caching.
# If requirements.txt hasn't changed, Docker will use the cached layer.
COPY requirements.txt .

# RUN: Executes a command inside the container during build time.
# pip install reads requirements.txt and installs all dependencies.
# --no-cache-dir: Prevents pip from caching, reducing image size.
# We upgrade pip, setuptools, and wheel first to avoid resolver bugs and dependency resolution issues.
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# COPY: Copy the entire application code into the container.
# The '.' means "copy everything from my current directory to /app"
COPY app/ ./app/
COPY tests/ ./tests/

# EXPOSE: Informs Docker that the container listens on port 8000.
# This is documentation; it doesn't actually publish the port.
# The actual publishing happens when we run the container with -p.
EXPOSE 8000

# CMD: The command that runs when the container starts.
# We use exec form (["command", "arg1", "arg2"]) for better signal handling.
# uvicorn: The ASGI server
# app.main:app -> module "app.main" with the variable "app"
# --host 0.0.0.0: Listen on all network interfaces (so we can access from outside)
# --port 8000: Listen on port 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]