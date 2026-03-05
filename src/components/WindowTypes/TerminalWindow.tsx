"use client";

import { useEffect, useRef, useState } from "react";
import Window from "@/components/Window/Window";
import type { WindowState } from "@/state/windowManager";
import type { TerminalSessionEntry } from "@/data/projects";

interface TerminalWindowProps {
  win: WindowState;
  session: TerminalSessionEntry[];
  repoUrl?: string;
}

interface RenderedLine {
  type: "command" | "output";
  text: string;
  /** True while the line is still being typed character by character */
  typing?: boolean;
}

const CHAR_DELAY_MS = 40;  // ms between keystrokes
const OUTPUT_DELAY_MS = 300; // ms pause before output appears

/**
 * Terminal window with an animated session replay.
 *
 * The session is a sequence of commands and outputs. When the window mounts,
 * commands type themselves out character by character (like a real terminal),
 * then the output appears after a short pause. Delays between entries are
 * configurable via { type: "delay", ms } entries.
 */
export default function TerminalWindow({
  win,
  session,
  repoUrl,
}: TerminalWindowProps) {
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever lines change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Run the animation once on mount
  useEffect(() => {
    let cancelled = false;

    async function runSession() {
      for (const entry of session) {
        if (cancelled) return;

        if (entry.type === "delay" && entry.ms) {
          await sleep(entry.ms);
          continue;
        }

        if (entry.type === "command" && entry.text) {
          // Add a new empty command line
          setLines((prev) => [...prev, { type: "command", text: "", typing: true }]);
          await sleep(200);

          // Type out the command
          for (let i = 1; i <= entry.text.length; i++) {
            if (cancelled) return;
            const partial = entry.text.slice(0, i);
            setLines((prev) => [
              ...prev.slice(0, -1),
              { type: "command", text: partial, typing: true },
            ]);
            await sleep(CHAR_DELAY_MS);
          }

          // Finish typing
          setLines((prev) => [
            ...prev.slice(0, -1),
            { type: "command", text: entry.text!, typing: false },
          ]);
          await sleep(OUTPUT_DELAY_MS);
        }

        if (entry.type === "output" && entry.text) {
          await sleep(100);
          // Split multi-line output into separate lines
          const outputLines = entry.text.split("\n");
          for (const line of outputLines) {
            if (cancelled) return;
            setLines((prev) => [...prev, { type: "output", text: line }]);
            await sleep(40);
          }
          await sleep(200);
        }
      }

      if (!cancelled) setDone(true);
    }

    runSession();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Window win={win}>
      {/* Repo link bar */}
      {repoUrl && (
        <div
          style={{
            padding: "3px 8px",
            borderBottom: "1px solid #444",
            background: "#1a1a1a",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#33ff33",
              fontSize: "var(--font-size-small)",
              fontFamily: "var(--font-mono)",
              textDecoration: "underline",
            }}
          >
            View on GitHub ↗
          </a>
        </div>
      )}

      <div
        ref={scrollRef}
        className="terminal-body sys7-scroll"
        role="log"
        aria-label="Terminal session replay"
        aria-live="polite"
      >
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line${line.type === "command" ? " terminal-line--input" : ""}`}>
            {line.text}
            {/* Blinking cursor at the end of the currently-typing line */}
            {line.typing && <span className="terminal-cursor" aria-hidden="true" />}
          </div>
        ))}

        {/* Idle cursor after session completes */}
        {done && (
          <div className="terminal-line terminal-line--input">
            <span className="terminal-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </Window>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
