"use client";

import { useEffect, useRef, useState } from "react";
import Window from "@/components/Window/Window";
import type { WindowState } from "@/state/windowManager";

interface CanvasWindowProps {
  win: WindowState;
  repoUrl?: string;
}

/**
 * Conway's Game of Life — rendered live inside a canvas window.
 *
 * The simulation starts paused; the user clicks "Run" to begin.
 * Controls: Run/Pause, Step, Clear, Randomise.
 *
 * Implementation uses a typed Uint8Array for the cell grid and
 * requestAnimationFrame for the render loop.
 */
export default function CanvasWindow({ win, repoUrl }: CanvasWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<LifeState | null>(null);
  const animRef = useRef<number>(0);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);

  const CELL_SIZE = 8;

  // Initialise the grid whenever the window is resized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cols = Math.floor(canvas.clientWidth / CELL_SIZE);
    const rows = Math.floor(canvas.clientHeight / CELL_SIZE);

    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    stateRef.current = createLife(cols, rows);
    randomise(stateRef.current);
    draw(canvas, stateRef.current);
  }, [win.width, win.height]);

  // Animation loop
  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = 0;
    const FPS = 10;
    const interval = 1000 / FPS;

    function frame(now: number) {
      if (now - lastTime >= interval) {
        lastTime = now;
        const canvas = canvasRef.current;
        const state = stateRef.current;
        if (canvas && state) {
          step(state);
          draw(canvas, state);
          setGeneration((g) => g + 1);
        }
      }
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  function handleRunPause() {
    setRunning((r) => !r);
  }

  function handleStep() {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (canvas && state) {
      step(state);
      draw(canvas, state);
      setGeneration((g) => g + 1);
    }
  }

  function handleRandomise() {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (canvas && state) {
      randomise(state);
      draw(canvas, state);
      setGeneration(0);
    }
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (canvas && state) {
      state.cells.fill(0);
      draw(canvas, state);
      setGeneration(0);
    }
  }

  // Toggle individual cells on click
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x >= 0 && x < state.cols && y >= 0 && y < state.rows) {
      const idx = y * state.cols + x;
      state.cells[idx] = state.cells[idx] ? 0 : 1;
      draw(canvas, state);
    }
  }

  return (
    <Window win={win}>
      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderBottom: "1px solid #000",
          background: "var(--color-gray-light)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <button className="sys7-btn" onClick={handleRunPause} aria-label={running ? "Pause" : "Run"}>
          {running ? "⏸ Pause" : "▶ Run"}
        </button>
        <button className="sys7-btn" onClick={handleStep} disabled={running}>Step</button>
        <button className="sys7-btn" onClick={handleRandomise}>Randomise</button>
        <button className="sys7-btn" onClick={handleClear}>Clear</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "var(--font-size-small)", color: "#555" }}>
          Gen {generation}
        </span>
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sys7-btn"
            style={{ textDecoration: "none", fontSize: "var(--font-size-small)" }}
          >
            GitHub ↗
          </a>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: "hidden", background: "#000" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", cursor: "crosshair", imageRendering: "pixelated" }}
          onClick={handleCanvasClick}
          aria-label="Conway's Game of Life grid — click to toggle cells"
        />
      </div>
    </Window>
  );
}

// ── Game of Life engine ───────────────────────────────────────────────────────

interface LifeState {
  cells: Uint8Array;
  next: Uint8Array;
  cols: number;
  rows: number;
}

function createLife(cols: number, rows: number): LifeState {
  return {
    cells: new Uint8Array(cols * rows),
    next: new Uint8Array(cols * rows),
    cols,
    rows,
  };
}

function randomise(state: LifeState) {
  for (let i = 0; i < state.cells.length; i++) {
    state.cells[i] = Math.random() < 0.3 ? 1 : 0;
  }
}

function step(state: LifeState) {
  const { cells, next, cols, rows } = state;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbours = countNeighbours(cells, x, y, cols, rows);
      const alive = cells[y * cols + x];
      next[y * cols + x] = alive
        ? neighbours === 2 || neighbours === 3 ? 1 : 0
        : neighbours === 3 ? 1 : 0;
    }
  }

  state.cells.set(next);
}

function countNeighbours(
  cells: Uint8Array,
  x: number,
  y: number,
  cols: number,
  rows: number,
): number {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;
      count += cells[ny * cols + nx];
    }
  }
  return count;
}

function draw(canvas: HTMLCanvasElement, state: LifeState) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { cells, cols, rows } = state;
  const CELL = canvas.width / cols;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#33ff33";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (cells[y * cols + x]) {
        ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
      }
    }
  }
}
