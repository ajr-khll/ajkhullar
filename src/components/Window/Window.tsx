"use client";

import React from "react";
import { useWindowManager, type WindowState } from "@/state/windowManager";
import { useDrag } from "@/hooks/useDrag";
import { useResize } from "@/hooks/useResize";
import TitleBar from "./TitleBar";
import ResizeHandle from "./ResizeHandle";

interface WindowProps {
  win: WindowState;
  /** The content to render inside the window body. */
  children: React.ReactNode;
  /** If true, skip the resize handle even when resizable=true. */
  forceNoResize?: boolean;
}

/**
 * Generic System 7 window shell.
 *
 * Handles:
 *   - Absolute positioning (x, y, width, height from store)
 *   - Z-ordering (clicking brings to front)
 *   - Drag via title bar (shows global dot-outline; snaps on mouseup)
 *   - Resize via bottom-right handle
 *   - WindowShade collapse (double-click title bar collapses to title bar only)
 *   - Close via close box
 *
 * Content is passed as children so each window type is a thin wrapper.
 */
export default function Window({ win, children, forceNoResize }: WindowProps) {
  const focusWindow = useWindowManager((s) => s.focusWindow);
  const topZIndex = useWindowManager((s) => s.topZIndex);

  const { onTitleBarMouseDown } = useDrag(win.id);
  const { onResizeMouseDown } = useResize(win.id);

  const isActive = win.zIndex === topZIndex;
  const canResize = win.resizable !== false && !forceNoResize;

  function handleWindowMouseDown() {
    focusWindow(win.id);
  }

  return (
    <div
      className={`window${win.type === "dialog" ? " window--dialog" : ""}`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        // When minimized, height collapses to just the title bar
        height: win.isMinimized ? "auto" : win.height,
        zIndex: win.zIndex,
      }}
      onMouseDown={handleWindowMouseDown}
      role="dialog"
      aria-label={win.title}
      aria-modal={win.type === "dialog"}
    >
      <TitleBar
        windowId={win.id}
        title={win.title}
        isMinimized={win.isMinimized}
        isActive={isActive}
        onMouseDown={onTitleBarMouseDown}
      />

      {/* Content area — hidden when window is minimized (WindowShade) */}
      {!win.isMinimized && (
        <div className="window__content">
          {children}
        </div>
      )}

      {/* Resize handle — only when expanded and resizable */}
      {!win.isMinimized && canResize && (
        <ResizeHandle onMouseDown={onResizeMouseDown} />
      )}
    </div>
  );
}
