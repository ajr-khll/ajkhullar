"use client";

import { useEffect, useState } from "react";

/**
 * Live clock displayed in the right side of the menu bar.
 * Updates every second. Format: "3:04 PM"
 */
export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="menu-bar__item"
      style={{ cursor: "default", minWidth: 60, justifyContent: "center" }}
      aria-label={`Current time: ${time}`}
      aria-live="off"
    >
      {time}
    </div>
  );
}
