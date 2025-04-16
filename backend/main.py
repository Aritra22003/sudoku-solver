from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from solver import solve_puzzle, is_solvable

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PuzzleRequest(BaseModel):
    board: List[List[int]]

class PuzzleResponse(BaseModel):
    solution: List[List[List[int]]]
    moves: int
    solvable: bool

@app.post("/solve", response_model=PuzzleResponse)
async def solve(puzzle: PuzzleRequest):
    if not puzzle.board or not all(len(row) == len(puzzle.board) for row in puzzle.board):
        raise HTTPException(status_code=400, detail="Invalid puzzle format")

    solvable = is_solvable(puzzle.board)
    if not solvable:
        return PuzzleResponse(solution=[], moves=-1, solvable=False)

    solution, moves = solve_puzzle(puzzle.board)
    return PuzzleResponse(solution=solution, moves=moves, solvable=True)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
