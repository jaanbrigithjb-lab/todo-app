# TaskFlow: DevOps To-Do Application

A modern, responsive, and containerized To-Do application built with a FastAPI backend and a React (Vite) frontend. This project is configured with full Docker support and is ready for DevOps deployment pipelines.

---

## Tech Stack
*   **Backend:** Python 3.10, FastAPI, Pydantic (data contracts), Uvicorn (ASGI server)
*   **Frontend:** React 19, Vite, Vanilla CSS (Glassmorphism design system), Lucide React (icons)
*   **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD

---

## Features
*   **Task Management:** Full CRUD operations (Create, Read, Update, Delete) with status tracking.
*   **Stats Dashboard:** Live counts of total, active, and completed tasks, plus completion rate.
*   **Modern Aesthetics:** Dark mode dashboard with responsive grid layout, glassmorphic card overlays, and fluid hover animations.
*   **API Base URL Switcher:** Easily toggle between localhost development and production (e.g., Render) backend APIs directly inside the frontend UI settings.
*   **Structured Logging:** Backend uses machine-readable JSON logs for production observability.
*   **Health Checks:** Dedicated `/health` endpoint for monitoring systems.

---

## Running the App with Docker Compose (Recommended)

The easiest way to start the entire stack (both backend and frontend) is using Docker Compose:

```bash
# Build and start all services in detached mode
sudo docker compose up -d --build
```

*   **Frontend:** Open `http://localhost:3000`
*   **Backend API:** Running on `http://localhost:8000`
*   **Interactive API Docs (Swagger UI):** Open `http://localhost:8000/docs`

```bash
# Stop the containers
sudo docker compose down
```

---

## Local Development (Manual Mode)

### 1. Running the Backend
Ensure you are in the project root directory.

```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 2. Running the Frontend
Navigate to the `frontend` directory.

```bash
cd frontend

# Install package dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will run on `http://localhost:5173`. Open this URL in your browser.

---

## Manual Docker Execution (Without Compose)

### Backend Container
```bash
# Build backend image
sudo docker build -t todo-backend .

# Run backend container
sudo docker run -d -p 8000:8000 --name my-todo-backend todo-backend
```

### Frontend Container
```bash
# Build frontend image
cd frontend
sudo docker build -t todo-frontend .

# Run frontend container
sudo docker run -d -p 3000:80 --name my-todo-frontend todo-frontend
```

---

## Git Integration Workflow

Initialize repository, stage changes, commit, and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Configure your Git local identity (if prompted)
git config user.name "money_d_luffy"
git config user.email "money_d_luffy@MonkeyDLuffy.local"

# Stage all files (includes backend, frontend, docker configurations)
git add .

# Commit changes
git commit -m "feat: implement React frontend with Docker Compose and PATCH endpoints"

# Add remote repository
git remote add origin https://github.com/jaanbrigithjb-lab/todo-app.git

# Set default branch to main
git branch -M main

# Push changes
git push -u origin main
```
