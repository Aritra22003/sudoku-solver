import heapq
import numpy as np
from typing import List, Tuple, Set
from copy import deepcopy

class PuzzleNode:
    def __init__(self, board: List[List[int]], g_score: int = 0, parent=None):
        self.board = board
        self.g_score = g_score
        self.h_score = self.calculate_heuristic()
        self.f_score = self.g_score + self.h_score
        self.parent = parent

    def calculate_heuristic(self) -> int:
        """Calculate Manhattan distance heuristic for N-puzzle"""
        total_distance = 0
        n = len(self.board)
        for i in range(n):
            for j in range(n):
                value = self.board[i][j]
                if value != 0:  # Skip empty tile
                    target_x, target_y = (value - 1) // n, (value - 1) % n
                    total_distance += abs(i - target_x) + abs(j - target_y)
        return total_distance

    def __lt__(self, other):
        return self.f_score < other.f_score

    def get_blank_position(self) -> Tuple[int, int]:
        """Find the position of the empty tile (0)"""
        for i in range(len(self.board)):
            for j in range(len(self.board)):
                if self.board[i][j] == 0:
                    return i, j
        return -1, -1

    def get_neighbors(self) -> List['PuzzleNode']:
        """Generate all possible next states"""
        neighbors = []
        blank_x, blank_y = self.get_blank_position()
        moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # Right, Down, Left, Up

        for dx, dy in moves:
            new_x, new_y = blank_x + dx, blank_y + dy
            if 0 <= new_x < len(self.board) and 0 <= new_y < len(self.board):
                new_board = deepcopy(self.board)
                new_board[blank_x][blank_y] = new_board[new_x][new_y]
                new_board[new_x][new_y] = 0
                neighbors.append(PuzzleNode(new_board, self.g_score + 1, self))

        return neighbors

def solve_puzzle(initial_state: List[List[int]]) -> Tuple[List[List[List[int]]], int]:
    """
    Solve N-puzzle using A* algorithm
    Returns: (solution_path, number_of_moves)
    """
    initial_node = PuzzleNode(initial_state)
    goal_state = [[i + 1 for i in range(j * len(initial_state), (j + 1) * len(initial_state))] 
                  for j in range(len(initial_state))]
    goal_state[-1][-1] = 0

    open_set = [initial_node]
    closed_set: Set[str] = set()

    while open_set:
        current = heapq.heappop(open_set)
        current_str = str(current.board)

        if current.board == goal_state:
            # Reconstruct path
            path = []
            while current:
                path.append(current.board)
                current = current.parent
            return list(reversed(path)), len(path) - 1

        if current_str in closed_set:
            continue

        closed_set.add(current_str)

        for neighbor in current.get_neighbors():
            neighbor_str = str(neighbor.board)
            if neighbor_str not in closed_set:
                heapq.heappush(open_set, neighbor)

    return [], -1  # No solution found

def is_solvable(puzzle: List[List[int]]) -> bool:
    """Check if the N-puzzle is solvable"""
    flat = [num for row in puzzle for num in row if num != 0]
    inversions = sum(1 for i in range(len(flat)) 
                    for j in range(i + 1, len(flat)) if flat[i] > flat[j])
    n = len(puzzle)
    
    # Find row of blank from bottom
    blank_row = 0
    for i in range(n-1, -1, -1):
        if 0 in puzzle[i]:
            blank_row = n - i
            break

    if n % 2 == 1:
        return inversions % 2 == 0
    else:
        return (inversions + blank_row) % 2 == 1
