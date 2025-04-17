# 🧩 Sudoku Solver Web App

A full-stack web application to solve 9x9 Sudoku puzzles using a fast backtracking algorithm. Users can input custom puzzles and visualize the solving process in real-time.

## 🚀 Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** FastAPI
- **Communication:** REST API (JSON)

---

## 📷 Demo

<!-- Add a screenshot here -->
![Sudoku Solver UI Screenshot](https://github.com/Aritra22003/sudoku-solver/blob/c052be2eee711addd16c10cfb09e79d4c5be00a4/sudoku-ui.png)

---

## ⚙️ Features

- Interactive Sudoku board
- Solve puzzle via FastAPI backend
- Step-by-step animation of solving process
- Input validation and reset functionality

---

## 🧠 Algorithm

The backend uses a classic **recursive backtracking** algorithm:
- Tries filling empty cells with valid digits
- Checks constraints (row, column, 3×3 grid)
- Backtracks on conflicts until a solution is found

---

## 🛠️ Getting Started

### Backend

1. Navigate to backend:
   ```bash
   cd backend
Create and activate a virtual environment:

bash
Copy
Edit
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
Install dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Run the server:

bash
Copy
Edit
uvicorn main:app --reload
Visit http://127.0.0.1:8000/docs for Swagger UI.

Frontend
Navigate to frontend:

bash
Copy
Edit
cd frontend
Install dependencies:

bash
Copy
Edit
npm install
Start the React app:

bash
Copy
Edit
npm start
The app will run on http://localhost:3000.

🔗 API Overview
POST /solve

Request Body:

json
Copy
Edit
{
  "board": [[...], [...], ...]  // 9x9 grid with 0 as empty
}
Response:

json
Copy
Edit
{
  "solution": [[...], [...], ...]
}
📦 Deployment
Backend: Deploy to Render/Heroku using Uvicorn

Frontend: Deploy to Netlify or Vercel

Add proxy in frontend package.json:

json
Copy
Edit
"proxy": "http://localhost:8000"
🧪 To-Do
 Add puzzle generator

 Difficulty selector

 OCR input from image

 Solver step debugger

📄 License
MIT License
