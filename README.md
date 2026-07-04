# TaskFlow: DevOps To-Do Application

A modern, responsive, and containerized To-Do application built with a FastAPI backend and a React (Vite) frontend. This project is configured with full Docker support and is ready for DevOps deployment pipelines.

---

## Tech Stack
*   **Backend:** Python 3.10, FastAPI, Pydantic (data contracts), Uvicorn (ASGI server)
*   **Frontend:** React 19, Vite, Vanilla CSS (Glassmorphism design system), Lucide React (icons)
*   **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD

---

## Project Structure
```
├── Backend/              # FastAPI Backend project
│   ├── app/              # Application logic (main.py, models.py)
│   ├── tests/            # Pytest test suite
│   ├── Dockerfile        # Container configuration
│   └── requirements.txt  # Python dependencies
├── frontend/             # React (Vite) Frontend project
│   ├── src/              # React source files
│   ├── Dockerfile        # Production multi-stage Docker build
│   └── package.json      # Node.js dependencies
└── docker-compose.yml    # Root Docker Compose orchestrating both services
```

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
Navigate to the `Backend` directory.

```bash
cd Backend

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
