"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sounds } from "./chessSounds";

/* Play against Arpeggio. The engine is compiled to WebAssembly and runs in a
   Web Worker (public/blog/arpeggio/engine/), so it uses the visitor's CPU,
   one core, only while it's thinking, and the page never stutters.

   The engine is the single source of truth for rules: it supplies the legal
   moves and the game status. This file only draws the board and applies the
   chosen move to the picture (castling, en passant and promotion included). */

type Color = "w" | "b";
type Board = Record<string, string>; // "e2" -> "wP"

const FILES = "abcdefgh";
const THINK_MS = 1000;
const BASE = "/blog/arpeggio";

const START: Board = (() => {
  const b: Board = {};
  const back = "RNBQKBNR";
  for (let i = 0; i < 8; i++) {
    const f = FILES[i];
    b[f + "1"] = "w" + back[i];
    b[f + "2"] = "wP";
    b[f + "7"] = "bP";
    b[f + "8"] = "b" + back[i];
  }
  return b;
})();

function applyMove(board: Board, uci: string): Board {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promo = uci[4];
  const b = { ...board };
  const piece = b[from];
  if (!piece) return b;
  delete b[from];
  // En passant: a pawn moving diagonally onto an empty square.
  if (piece[1] === "P" && from[0] !== to[0] && !b[to]) delete b[to[0] + from[1]];
  // Castling: the king moves two files; bring the rook across.
  if (piece[1] === "K" && Math.abs(FILES.indexOf(from[0]) - FILES.indexOf(to[0])) === 2) {
    const [rf, rt] = to[0] === "g" ? ["h", "f"] : ["a", "d"];
    b[rt + from[1]] = b[rf + from[1]];
    delete b[rf + from[1]];
  }
  b[to] = promo ? piece[0] + promo.toUpperCase() : piece;
  return b;
}

class Engine {
  private worker = new Worker(`${BASE}/engine/worker.js`);
  private pending = new Map<number, { resolve: (r: string) => void; reject: (e: Error) => void }>();
  private next = 0;

  constructor() {
    this.worker.onmessage = ({ data }) => {
      const p = this.pending.get(data.id);
      this.pending.delete(data.id);
      if (data.error) p?.reject(new Error(data.error));
      else p?.resolve(data.result);
    };
    this.worker.onerror = () => {
      for (const p of this.pending.values()) p.reject(new Error("engine failed to load"));
      this.pending.clear();
    };
  }

  call(cmd: "legal" | "go", position: string, ms?: number): Promise<string> {
    const id = this.next++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, cmd, position, ms });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

/** Resolves once the tab is visible, so a backgrounded tab never searches. */
const whenVisible = () =>
  new Promise<void>((resolve) => {
    if (!document.hidden) return resolve();
    const on = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", on);
      resolve();
    };
    document.addEventListener("visibilitychange", on);
  });

/** Still being played ("check" means the side to move is in check). */
const live = (status: string) => status === "play" || status === "check";

/** The sound for the move just made, given the position before it. */
function moveSound(before: Board, uci: string, status: string) {
  if (!live(status)) return sounds.end;
  if (status === "check") return sounds.check;
  const piece = before[uci.slice(0, 2)];
  const to = uci.slice(2, 4);
  if (before[to] || (piece?.[1] === "P" && uci[0] !== uci[2])) return sounds.capture;
  if (piece?.[1] === "K" && Math.abs(FILES.indexOf(uci[0]) - FILES.indexOf(uci[2])) === 2) return sounds.castle;
  return sounds.move;
}

const NAMES: Record<string, string> = { P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };

export function PlayArpeggio() {
  const engine = useRef<Engine | null>(null);
  const [you, setYou] = useState<Color | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [legal, setLegal] = useState<string[]>([]);
  const [status, setStatus] = useState("play");
  const [thinking, setThinking] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [promo, setPromo] = useState<string | null>(null); // "e7e8" awaiting a piece
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const soundOn = useRef(true);
  soundOn.current = sound;

  useEffect(() => {
    if (localStorage.getItem("chess-sound") === "off") setSound(false);
  }, []);
  const toggleSound = () => {
    localStorage.setItem("chess-sound", sound ? "off" : "on");
    setSound(!sound);
  };

  const board = useMemo(() => moves.reduce(applyMove, START), [moves]);
  const turn: Color = moves.length % 2 ? "b" : "w";

  useEffect(() => () => engine.current?.terminate(), []);

  // After every move: ask the engine what's legal, and let it reply if it's its turn.
  useEffect(() => {
    if (!you) return;
    const eng = (engine.current ??= new Engine());
    const position = `startpos moves ${moves.join(" ")}`.trim();
    let cancelled = false;
    setLegal([]);
    setSelected(null);

    (async () => {
      const [st, ...ls] = (await eng.call("legal", position)).split(" ");
      if (cancelled) return;
      setStatus(st);
      setLegal(ls);
      if (soundOn.current) {
        const last = moves.at(-1);
        if (!last) sounds.start();
        else {
          const play = moveSound(moves.slice(0, -1).reduce(applyMove, START), last, st);
          if (play === sounds.end) sounds.move();
          play();
        }
      }
      if (!live(st) || turn === you) return;
      await whenVisible();
      if (cancelled) return;
      setThinking(true);
      const reply = await eng.call("go", position, THINK_MS);
      if (cancelled) return;
      setThinking(false);
      setMoves((m) => [...m, reply]);
    })().catch((e) => {
      if (cancelled) return;
      engine.current?.terminate(); // start fresh on the next game
      engine.current = null;
      setThinking(false);
      setError(e.message);
    });

    return () => {
      cancelled = true;
    };
  }, [you, moves, turn]);

  const myTurn = you !== null && turn === you && live(status) && !thinking && legal.length > 0;
  const targets = selected ? legal.filter((m) => m.startsWith(selected)).map((m) => m.slice(2, 4)) : [];
  const last = moves.at(-1);

  const onSquare = (sq: string) => {
    if (!myTurn || promo) return;
    if (selected && targets.includes(sq)) {
      const options = legal.filter((m) => m.startsWith(selected + sq));
      if (options.length > 1) setPromo(selected + sq);
      else setMoves((m) => [...m, options[0]]);
      setSelected(null);
    } else if (board[sq]?.[0] === you && sq !== selected) {
      setSelected(sq);
    } else {
      setSelected(null);
    }
  };

  /** Begin a game as `color`, or clear the board and show the side picker. */
  const start = (color: Color | null) => {
    setMoves([]);
    setStatus("play");
    sounds.unlock();
    setThinking(false);
    setSelected(null);
    setPromo(null);
    setError(null);
    setYou(color);
  };

  const youLost = turn === you;
  const message = error
    ? `couldn't run the engine: ${error}`
    : !you
      ? ""
      : status === "checkmate"
        ? youLost
          ? "checkmate. arpeggio wins."
          : "checkmate. you win."
        : status === "stalemate"
          ? "stalemate. draw."
          : status === "fifty"
            ? "draw by the fifty-move rule."
            : status === "repetition"
              ? "draw by repetition."
              : status === "material"
                ? "draw, insufficient material."
                : thinking || turn !== you
                  ? "arpeggio is thinking…"
                  : "your move";

  const rows = [0, 1, 2, 3, 4, 5, 6, 7];
  const checked =
    you && (status === "check" || status === "checkmate")
      ? Object.keys(board).find((sq) => board[sq] === turn + "K")
      : undefined;
  const flip = you === "b";

  return (
    <section className="b-play">
      <div className="b-board-wrap">
      <div className="b-board-col">
      <div className="b-board" role="grid" aria-label="Chess board">
        {rows.map((r) =>
          rows.map((c) => {
            const f = flip ? 7 - c : c;
            const rank = flip ? r + 1 : 8 - r;
            const sq = FILES[f] + rank;
            const piece = board[sq];
            const dark = (f + rank) % 2 === 1;
            const cls = [
              "b-sq",
              dark ? "dark" : "light",
              last && (last.startsWith(sq) || last.slice(2, 4) === sq) ? "last" : "",
              sq === selected ? "sel" : "",
              sq === checked ? "check" : "",
              targets.includes(sq) ? (piece ? "dest capture" : "dest") : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={sq}
                className={cls}
                onClick={() => onSquare(sq)}
                aria-label={piece ? `${sq} ${piece[0] === "w" ? "white" : "black"} ${NAMES[piece[1]]}` : sq}
              >
                {c === 0 && <span className="b-coord b-rank">{rank}</span>}
                {r === 7 && <span className="b-coord b-file">{FILES[f]}</span>}
                {piece && <img src={`${BASE}/pieces/${piece}.svg`} alt="" draggable={false} />}
              </button>
            );
          }),
        )}

        {!you && (
          <div className="b-pick">
            <p>Play as</p>
            <div>
              {(["w", "b"] as const).map((c) => (
                <button key={c} onClick={() => start(c)}>
                  <img src={`${BASE}/pieces/${c}K.svg`} alt="" />
                  {c === "w" ? "White" : "Black"}
                </button>
              ))}
            </div>
          </div>
        )}

        {promo && you && (
          <div className="b-promo">
            {["q", "r", "b", "n"].map((p) => (
              <button
                key={p}
                aria-label={`Promote to ${NAMES[p.toUpperCase()]}`}
                onClick={() => {
                  setMoves((m) => [...m, promo + p]);
                  setPromo(null);
                }}
              >
                <img src={`${BASE}/pieces/${you}${p.toUpperCase()}.svg`} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="b-play-bar">
        <span aria-live="polite">{message}</span>
        <span>
          <button onClick={toggleSound}>{sound ? "sound on" : "sound off"}</button>
          {you && (
            <>
              {" · "}
              <button onClick={() => start(null)}>new game</button>
            </>
          )}
        </span>
      </div>
      </div>
      </div>
    </section>
  );
}
