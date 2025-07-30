import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color scheme:
 * --primary: #1976d2 (X moves, main headings, win highlight)
 * --accent: #ff9800 (O moves, accent highlight)
 * --secondary: #ffffff (background, general UI)
 */

// Helper to check winner
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6], // Diags
];

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  for (let [a, b, c] of LINES) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (squares.every(Boolean)) {
    return { winner: "draw" };
  }
  return null;
}

// Simple AI: pick random empty square
// PUBLIC_INTERFACE
function nextAIMove(squares) {
  const empty = squares.reduce((arr, val, idx) => (!val ? [...arr, idx] : arr), []);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// PUBLIC_INTERFACE
function App() {
  // Game state
  const [mode, setMode] = useState("pvp"); // or "ai"
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [winningLine, setWinningLine] = useState([]);
  const [aiThinking, setAIThinking] = useState(false);

  // Theme is always light, but can hook in dark mode if desired
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Compute game state after square click
  useEffect(() => {
    const res = calculateWinner(squares);
    if (res) {
      if (res.winner === "draw") {
        setStatus("It's a draw!");
      } else {
        setStatus(`${res.winner === "X" ? "Player 1 (X)" : mode === "ai" ? "AI (O)" : "Player 2 (O)"} wins!`);
        setWinningLine(res.line ?? []);
      }
      setGameOver(true);
    } else {
      setStatus(
        mode === "ai"
          ? xIsNext
            ? "Your turn (X)"
            : "AI's turn (O)"
          : xIsNext
          ? "Player 1's turn (X)"
          : "Player 2's turn (O)"
      );
      setGameOver(false);
      setWinningLine([]);
    }
  }, [squares, xIsNext, mode]);

  // AI move effect
  useEffect(() => {
    if (
      mode === "ai" &&
      !xIsNext &&
      !gameOver &&
      !aiThinking
    ) {
      setAIThinking(true);
      // Delay for a more natural AI feel
      const handle = setTimeout(() => {
        const idx = nextAIMove(squares);
        if (idx !== null) {
          handleSquareClick(idx);
        }
        setAIThinking(false);
      }, 500);
      return () => clearTimeout(handle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xIsNext, mode, gameOver, aiThinking, squares]);

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    if (window.confirm("Switch mode? This will restart the game.")) {
      setMode(e.target.value);
      restartGame(e.target.value);
    }
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || gameOver) return;
    setSquares((prev) => {
      const copy = [...prev];
      copy[idx] = xIsNext ? "X" : "O";
      return copy;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function restartGame(forceMode = null) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus(
      (forceMode ?? mode) === "ai"
        ? "Your turn (X)"
        : "Player 1's turn (X)"
    );
    setGameOver(false);
    setWinningLine([]);
    setAIThinking(false);
  }

  // UI Components
  function renderSquare(idx) {
    let value = squares[idx] || "";
    let highlight =
      winningLine.includes(idx) ? "square-win" : "";
    // Style X vs O
    let style = !squares[idx] ? {} :
      value === "X"
        ? { color: "var(--primary)" }
        : { color: "var(--accent)" };
    return (
      <button
        className={`ttt-square ${highlight}`}
        key={idx}
        style={style}
        aria-label={`Square ${idx + 1}`}
        onClick={() =>
          !aiThinking && handleSquareClick(idx)
        }
        disabled={!!squares[idx] || gameOver || (mode === "ai" && !xIsNext)}
      >
        {value}
      </button>
    );
  }

  return (
    <div className="ttt-app-bg">
      <div className="ttt-outer-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div className="ttt-mode-row">
          <label htmlFor="ttt-mode" className="ttt-label">
            Mode:
          </label>
          <select
            id="ttt-mode"
            value={mode}
            className="ttt-mode-select"
            onChange={handleModeChange}
            disabled={aiThinking}
            aria-label="Choose game mode"
          >
            <option value="pvp">Player vs Player</option>
            <option value="ai">Player vs AI</option>
          </select>
        </div>
        <div className="ttt-status" data-status={status}>
          {status}
        </div>
        <div className="ttt-board-row">
          <div className="ttt-board">
            {[...Array(9)].map((_, idx) => renderSquare(idx))}
          </div>
        </div>
        <div className="ttt-controls">
          <button
            className="ttt-restart-btn"
            onClick={() => restartGame()}
            disabled={aiThinking}
          >
            Restart Game
          </button>
        </div>
        <div className="ttt-credit">
          <span>
            Made with <span style={{ color: "#ff9800" }}>React</span>.
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
