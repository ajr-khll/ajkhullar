"use client";

import { useWindowManager } from "@/state/windowManager";

/**
 * Renders the global drag outline — a dotted rectangle that follows the
 * cursor while the user is dragging a window title bar. The actual window
 * does not move until mouseup (authentic System 7 behaviour).
 *
 * This component lives at the Desktop level so the outline is never clipped
 * by individual window bounds.
 */
export default function DragOutline() {
  const outline = useWindowManager((s) => s.dragOutline);

  if (!outline) return null;

  return (
    <div
      className="drag-outline"
      style={{
        left: outline.x,
        top: outline.y,
        width: outline.width,
        height: outline.height,
      }}
      aria-hidden="true"
    />
  );
}
