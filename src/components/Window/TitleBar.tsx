"use client";

import { useWindowManager } from "@/state/windowManager";

interface TitleBarProps {
  windowId: string;
  title: string;
  isMinimized: boolean;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * System 7 title bar with:
 *   - Pinstripes when active, solid gray when inactive
 *   - Close box (left)
 *   - Centered title punched through the pinstripes
 *   - Double-click to WindowShade (collapse/expand)
 */
export default function TitleBar({
  windowId,
  title,
  isMinimized,
  isActive,
  onMouseDown,
}: TitleBarProps) {
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const toggleMinimize = useWindowManager((s) => s.toggleMinimize);

  function handleCloseClick(e: React.MouseEvent) {
    e.stopPropagation();
    closeWindow(windowId);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.preventDefault();
    toggleMinimize(windowId);
  }

  return (
    <div
      className={`title-bar${isActive ? "" : " title-bar--inactive"}`}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      aria-label={`${title} — drag to move, double-click to ${isMinimized ? "expand" : "collapse"}`}
    >
      {/* Close box */}
      <button
        className="title-bar__close-box"
        onClick={handleCloseClick}
        onMouseDown={(e) => e.stopPropagation()} // don't start drag on close click
        aria-label={`Close ${title}`}
        title="Close"
      />

      {/* Title */}
      <span
        className={`title-bar__title${isActive ? "" : " title-bar__title--inactive"}`}
        aria-label={title}
      >
        {title}
      </span>
    </div>
  );
}
