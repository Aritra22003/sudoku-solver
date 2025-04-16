# N-Puzzle Solver

An interactive N-Puzzle solver using A* algorithm with React frontend and FastAPI backend.

## Features

- Interactive N-Puzzle board
- A* algorithm implementation for optimal solutions
- Step-by-step solution visualization
- Beautiful UI with animations
- Backend performance optimization with FastAPI

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Deployment

### Backend Deployment (Azure)

1. Create an Azure App Service
2. Configure Python version
3. Set up deployment from GitHub
4. Add environment variables if needed

### Frontend Deployment (Netlify)

1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Deploy

## Algorithm Details

The A* algorithm implementation uses the Manhattan distance heuristic to find the optimal solution path. The solver includes:

- Efficient priority queue implementation
- Solvability check before processing
- Solution path reconstruction
- Performance optimizations

## License

MIT
