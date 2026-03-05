"use client";

import { useCallback } from "react";
import { useWindowManager } from "@/state/windowManager";

/**
 * Provides a mousedown handler for the window resize handle (bottom-right corner).
 *
 * Resize is live — the window updates as the user drags, which is more usable
 * than the drag-outline approach used for moving windows.
 */
export function useResize(windowId: string) {
  const resizeWindow = useWindowManager((s) => s.resizeWindow);

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation(); // prevent the title-bar drag from firing

      const win = useWindowManager
        .getState()
        .windows.find((w) => w.id === windowId);
      if (!win) return;

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startWidth = win.width;
      const startHeight = win.height;
      const minWidth = win.minWidth ?? 200;
      const minHeight = win.minHeight ?? 100;

      function onMouseMove(e: MouseEvent) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        resizeWindow(
          windowId,
          Math.max(minWidth, startWidth + dx),
          Math.max(minHeight, startHeight + dy),
        );
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [windowId, resizeWindow],
  );

  return { onResizeMouseDown };
}
