---
description: How to start the GeetaGPT application (Frontend & Backend)
---

This workflow starts both the FastAPI backend and the Next.js frontend for GeetaGPT.

// turbo-all
1. Start the Backend Server:
   - Navigate to the `backend` directory.
   - Activate the virtual environment.
   - Run the Uvicorn server on port 8000.
```bash
cd backend && source ../venv/bin/activate && uvicorn app.main:app --port 8000
```

2. Start the Frontend Application:
   - Open a new terminal tab.
   - Navigate to the `frontend` directory.
   - Run the development server on port 3000.
```bash
cd frontend && npm run dev
```

3. Access the Application:
   - Open [http://localhost:3000](http://localhost:3000) in your browser.
