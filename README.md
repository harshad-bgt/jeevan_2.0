# Jeevan 2.0 - AI-Powered Blood Lifeline

Jeevan 2.0 is a next-generation blood donation matching platform that leverages Python/FastAPI, MongoDB Atlas, and Firebase Authentication to rapidly connect hospitals, blood banks, and donors in critical situations.

## Technology Stack

### Frontend
- React.js + Vite
- TailwindCSS (Styling)
- Firebase Web SDK (Authentication)
- Lucide React (Icons)
- React Router (Routing)

### Backend
- Python FastAPI
- Motor (Async PyMongo driver for MongoDB Atlas)
- Firebase Admin SDK
- Pydantic (Data validation and schemas)
- Uvicorn (ASGI server)

## Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Firebase Project
- MongoDB Atlas cluster (or local MongoDB)

## Setup Instructions

### 1. Frontend Setup
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
```
Edit `frontend/.env` with your Firebase project credentials.

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```
Edit `backend/.env` with your MongoDB connection string and Firebase Admin credentials.

### 3. Running the Application

**Run Frontend Development Server:**
```bash
cd frontend
npm run dev
```

**Run Backend API Server:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

## AI & ML Pipeline
The `backend/ml/` directory is scaffolded to support a future data engineering pipeline for the `AIService`. As donor responses are collected over time, models will be trained on responsiveness factors and proximity metrics to dynamically rank donors during emergencies.
