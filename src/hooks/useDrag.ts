"use client";

import { useCallback } from "react";
import { useWindowManager } from "@/state/windowManager";

const MENU_BAR_HEIGHT = 28; // px — windows cannot be dragged above the menu bar

/**
 * Provides a mousedown handler for the window title bar.
 *
 * System 7 drag behaviour:
 *   - While dragging, a dotted outline (stored in the global Zustand store)
 *     follows the mouse. The actual window does NOT move until mouseup.
 *   - On mouseup the window snaps to the final outline position.
 *
 * Using `useWindowManager.getState()` inside the imperative handlers avoids
 * stale-closure issues without adding the store state to the dependency array.
 */
export function useDrag(windowId: string) {
  const moveWindow = useWindowManager((s) => s.moveWindow);
  const focusWindow = useWindowManager((s) => s.focusWindow);
  const setDragOutline = useWindowManager((s) => s.setDragOutline);

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left-click only
      e.preventDefault();

      // Read current position at drag-start time (not stale from closure)
      const win = useWindowManager
        .getState()
        .windows.find((w) => w.id === windowId);
      if (!win) return;

      focusWindow(windowId);

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startWinX = win.x;
      const startWinY = win.y;

      // Show the initial outline at the window's current position
      setDragOutline({ x: startWinX, y: startWinY, width: win.width, height: win.isMinimized ? 20 : win.height });

      function onMouseMove(e: MouseEvent) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        setDragOutline({
          x: Math.max(0, startWinX + dx),
          y: Math.max(MENU_BAR_HEIGHT, startWinY + dy),
          width: win!.width,
          height: win!.isMinimized ? 20 : win!.height,
        });
      }

      function onMouseUp(e: MouseEvent) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        const newX = Math.max(0, startWinX + dx);
        const newY = Math.max(MENU_BAR_HEIGHT, startWinY + dy);

        moveWindow(windowId, newX, newY);
        setDragOutline(null);

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [windowId, focusWindow, moveWindow, setDragOutline],
  );

  return { onTitleBarMouseDown };
}
