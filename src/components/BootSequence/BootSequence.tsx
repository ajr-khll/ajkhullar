"use client";

import { useEffect, useRef, useState } from "react";
import { HappyMacIcon } from "@/components/icons/Icons";

interface BootSequenceProps {
  onComplete: () => void;
}

type Phase =
  | "gray"        // solid gray screen (200ms)
  | "happy-mac"   // show Happy Mac icon (400ms)
  | "progress"    // fill progress bar (800ms)
  | "done";

/**
 * System 7 startup sequence overlay.
 *
 * Phases:
 *   1. Solid gray (#AAAAAA) screen fades in
 *   2. Happy Mac icon appears
 *   3. Progress bar fills
 *   4. Dissolve out → desktop
 *
 * Stored in sessionStorage so it only plays once per browser session.
 * Click anywhere to skip.
 */
export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("gray");
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFadeOut(true);
    setTimeout(onComplete, 400);
  }

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: show screen
    timers.push(setTimeout(() => setPhase("happy-mac"), 200));

    // Phase 2: show progress bar
    timers.push(setTimeout(() => setPhase("progress"), 600));

    // Phase 3: animate progress bar in steps
    timers.push(
      setTimeout(() => {
        let p = 0;
        const tick = setInterval(() => {
          p += Math.random() * 15 + 5;
          if (p >= 100) {
            p = 100;
            clearInterval(tick);
            setProgress(100);
            // Small pause at 100% before dissolve
            timers.push(setTimeout(finish, 300));
          } else {
            setProgress(Math.min(p, 100));
          }
        }, 80);
        timers.push(tick as unknown as ReturnType<typeof setTimeout>);
      }, 800),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={finish}
      style={{
        position: "fixed",
        inset: 0,
        background: "#AAAAAA",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        zIndex: "var(--z-boot)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 400ms ease-out",
        cursor: "default",
      }}
      aria-label="Loading — click to skip"
      role="progressbar"
      aria-valuenow={progress}
    >
      {/* Happy Mac icon */}
      {(phase === "happy-mac" || phase === "progress") && (
        <div
          style={{
            opacity: phase === "happy-mac" || phase === "progress" ? 1 : 0,
            transition: "opacity 200ms",
          }}
        >
          <HappyMacIcon size={64} />
        </div>
      )}

      {/* Progress bar */}
      {phase === "progress" && (
        <div
          style={{
            width: 120,
            height: 12,
            border: "1px solid #000",
            background: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${progress}%`,
              background: "#000",
              transition: "width 80ms linear",
            }}
          />
        </div>
      )}

      {/* Skip hint */}
      <p
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: 10,
          color: "#666",
          fontFamily: "var(--font-ui)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        Click anywhere to skip
      </p>
    </div>
  );
}
