"use client";

import { useState } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

/**
 * Balloon Help tooltip (System 7.5 feature).
 * Wraps any element; shows a tooltip on hover after a short delay.
 */
export default function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    const t = setTimeout(() => setVisible(true), 600);
    setTimer(t);
  }

  function handleMouseLeave() {
    if (timer) clearTimeout(timer);
    setVisible(false);
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && (
        <div className="tooltip" role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
}
