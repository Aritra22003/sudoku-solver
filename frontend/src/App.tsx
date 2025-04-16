import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PuzzleState {
  board: number[][];
  solution: number[][][];
  currentStep: number;
  isLoading: boolean;
  moves: number;
  timeElapsed: number;
  bestMoves: number | null;
  bestTime: number | null;
  isComplete: boolean;
  difficulty: string;
  hintsRemaining: number;
  moveHistory: number[][][];
}

const PRESET_PUZZLES = [
  {
    name: "Easy",
    board: [[1, 2, 3], [4, 0, 6], [7, 5, 8]],
    difficulty: "Easy",
    hints: 3
  },
  {
    name: "Medium",
    board: [[1, 2, 3], [7, 4, 6], [5, 8, 0]],
    difficulty: "Medium",
    hints: 2
  },
  {
    name: "Hard",
    board: [[7, 2, 4], [5, 0, 6], [8, 3, 1]],
    difficulty: "Hard",
    hints: 1
  }
];

const App: React.FC = () => {
  const [size] = useState<number>(3);
  const [state, setState] = useState<PuzzleState>({
    board: Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => (i * size + j + 1) % (size * size))
    ),
    solution: [],
    currentStep: 0,
    isLoading: false,
    moves: 0,
    timeElapsed: 0,
    bestMoves: null,
    bestTime: null,
    isComplete: false,
    difficulty: "Easy",
    hintsRemaining: 3,
    moveHistory: []
  });
  const [timer, setTimer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (state.isLoading && !timer) {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
      setTimer(interval);
    } else if (!state.isLoading && timer) {
      clearInterval(timer);
      setTimer(null);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isLoading, timer]);

  useEffect(() => {
    const savedBestMoves = localStorage.getItem(`bestMoves-${state.difficulty}`);
    const savedBestTime = localStorage.getItem(`bestTime-${state.difficulty}`);
    if (savedBestMoves) setState(prev => ({ ...prev, bestMoves: parseInt(savedBestMoves) }));
    if (savedBestTime) setState(prev => ({ ...prev, bestTime: parseInt(savedBestTime) }));
  }, [state.difficulty]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkCompletion = (board: number[][]) => {
    const goalState = Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => (i * size + j + 1) % (size * size))
    );
    const isComplete = board.every((row, i) => 
      row.every((tile, j) => tile === goalState[i][j])
    );
    
    if (isComplete && !state.isComplete) {
      setShowConfetti(true);
      if (!state.bestMoves || state.moves < state.bestMoves) {
        localStorage.setItem(`bestMoves-${state.difficulty}`, state.moves.toString());
        setState(prev => ({ ...prev, bestMoves: state.moves }));
      }
      if (!state.bestTime || state.timeElapsed < state.bestTime) {
        localStorage.setItem(`bestTime-${state.difficulty}`, state.timeElapsed.toString());
        setState(prev => ({ ...prev, bestTime: state.timeElapsed }));
      }
      setTimeout(() => setShowConfetti(false), 3000);
    }
    return isComplete;
  };

  const handleTileClick = (row: number, col: number) => {
    if (state.isLoading) return;
    
    const newBoard = [...state.board.map(r => [...r])];
    const emptyPos = findEmptyPosition(newBoard);
    
    if (isAdjacent(row, col, emptyPos.row, emptyPos.col)) {
      // Save current board to history before making the move
      const newHistory = [...state.moveHistory, state.board.map(r => [...r])];
      
      newBoard[emptyPos.row][emptyPos.col] = newBoard[row][col];
      newBoard[row][col] = 0;
      const isComplete = checkCompletion(newBoard);
      
      setState(prev => ({
        ...prev,
        board: newBoard,
        moves: prev.moves + 1,
        isComplete,
        moveHistory: newHistory
      }));
    }
  };

  const undoMove = () => {
    if (state.moveHistory.length === 0) return;
    
    const previousBoard = state.moveHistory[state.moveHistory.length - 1];
    const newHistory = state.moveHistory.slice(0, -1);
    
    setState(prev => ({
      ...prev,
      board: previousBoard,
      moves: prev.moves - 1,
      moveHistory: newHistory,
      isComplete: false
    }));
  };

  const findEmptyPosition = (board: number[][]) => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 0) return { row: i, col: j };
      }
    }
    return { row: -1, col: -1 };
  };

  const isAdjacent = (row1: number, col1: number, row2: number, col2: number) => {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const getHint = () => {
    if (state.hintsRemaining <= 0 || state.solution.length === 0) return;
    
    const nextBoard = state.solution[Math.min(state.currentStep + 1, state.solution.length - 1)];
    setState(prev => ({
      ...prev,
      board: nextBoard,
      currentStep: Math.min(prev.currentStep + 1, prev.solution.length - 1),
      hintsRemaining: prev.hintsRemaining - 1,
      moves: prev.moves + 1
    }));
  };

  const loadPresetPuzzle = (preset: typeof PRESET_PUZZLES[0]) => {
    setState({
      board: preset.board,
      solution: [],
      currentStep: 0,
      isLoading: false,
      moves: 0,
      timeElapsed: 0,
      bestMoves: null,
      bestTime: null,
      isComplete: false,
      difficulty: preset.difficulty,
      hintsRemaining: preset.hints,
      moveHistory: []
    });
  };

  const shuffleBoard = () => {
    const moves = 100;
    let newBoard = [...state.board.map(r => [...r])];
    
    for (let i = 0; i < moves; i++) {
      const emptyPos = findEmptyPosition(newBoard);
      const possibleMoves: Array<{row: number, col: number}> = [];
      
      if (emptyPos.row > 0) possibleMoves.push({ row: emptyPos.row - 1, col: emptyPos.col });
      if (emptyPos.row < size - 1) possibleMoves.push({ row: emptyPos.row + 1, col: emptyPos.col });
      if (emptyPos.col > 0) possibleMoves.push({ row: emptyPos.row, col: emptyPos.col - 1 });
      if (emptyPos.col < size - 1) possibleMoves.push({ row: emptyPos.row, col: emptyPos.col + 1 });
      
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      newBoard[emptyPos.row][emptyPos.col] = newBoard[move.row][move.col];
      newBoard[move.row][move.col] = 0;
    }
    
    setState({
      ...state,
      board: newBoard,
      solution: [],
      currentStep: 0,
      moves: 0,
      timeElapsed: 0,
      isComplete: false,
      moveHistory: []
    });
  };

  const solvePuzzle = async () => {
    setState({ ...state, isLoading: true });
    try {
      const response = await axios.post('http://localhost:8000/solve', {
        board: state.board
      });
      setState({
        ...state,
        solution: response.data.solution,
        isLoading: false,
        currentStep: 0
      });
    } catch (err) {
      setState({
        ...state,
        isLoading: false,
        solution: [],
        currentStep: 0
      });
    }
  };

  const nextStep = () => {
    if (state.currentStep < state.solution.length - 1) {
      setState({
        ...state,
        board: state.solution[state.currentStep + 1],
        currentStep: state.currentStep + 1
      });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      setState({
        ...state,
        board: state.solution[state.currentStep - 1],
        currentStep: state.currentStep - 1
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-6 flex flex-col justify-center sm:py-12">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          🎉🎊✨
        </div>
      )}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="text-center pb-8">
                <h1 className="text-3xl font-bold text-gray-900">N-Puzzle Solver</h1>
                <p className="mt-2 text-gray-600">Using A* Algorithm</p>
                <div className="mt-4 flex justify-center space-x-2">
                  {PRESET_PUZZLES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => loadPresetPuzzle(preset)}
                      className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                        state.difficulty === preset.difficulty
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-between items-center mb-4 text-sm font-medium">
                  <div className="space-y-1">
                    <div className="text-blue-600">Moves: {state.moves}</div>
                    {state.bestMoves && (
                      <div className="text-green-600">Best: {state.bestMoves}</div>
                    )}
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-blue-600">Time: {formatTime(state.timeElapsed)}</div>
                    {state.bestTime && (
                      <div className="text-green-600">Best: {formatTime(state.bestTime)}</div>
                    )}
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-yellow-600">
                    Hints: {state.hintsRemaining} remaining
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {state.board.map((row, i) => (
                    <div key={i} className="flex justify-center">
                      {row.map((tile, j) => (
                        <button
                          key={j}
                          onClick={() => handleTileClick(i, j)}
                          className={`w-16 h-16 text-xl font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 
                            ${tile === 0 
                              ? 'bg-gray-200 cursor-default' 
                              : 'bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-600'
                            } ${state.isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
                          disabled={state.isLoading || tile === 0}
                        >
                          {tile === 0 ? '' : tile}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={shuffleBoard}
                    disabled={state.isLoading}
                  >
                    Shuffle
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={solvePuzzle}
                    disabled={state.isLoading}
                  >
                    {state.isLoading ? 'Solving...' : 'Solve'}
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={getHint}
                    disabled={state.isLoading || state.hintsRemaining <= 0 || state.solution.length === 0}
                  >
                    Hint ({state.hintsRemaining})
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={undoMove}
                    disabled={state.isLoading || state.moveHistory.length === 0}
                  >
                    Undo
                  </button>
                </div>

                {state.moveHistory.length > 0 && (
                  <div className="text-center text-sm text-gray-500">
                    Move history: {state.moveHistory.length} moves
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
