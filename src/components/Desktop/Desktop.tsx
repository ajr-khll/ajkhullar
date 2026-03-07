"use client";

import { useState, useCallback } from "react";
import { useWindowManager, type WindowState } from "@/state/windowManager";
import {
  DESKTOP_ICONS,
  PROJECTS,
  SECTION_WINDOWS,
  ABOUT_CONTENT,
} from "@/data/projects";
import DesktopPattern from "./DesktopPattern";
import DesktopIcon from "./DesktopIcon";
import DragOutline from "@/components/Window/DragOutline";

// Window type components
import DocumentWindow from "@/components/WindowTypes/DocumentWindow";
import FinderWindow from "@/components/WindowTypes/FinderWindow";
import ApplicationWindow from "@/components/WindowTypes/ApplicationWindow";
import TerminalWindow from "@/components/WindowTypes/TerminalWindow";
import CanvasWindow from "@/components/WindowTypes/CanvasWindow";
import DialogWindow from "@/components/WindowTypes/DialogWindow";

/**
 * The desktop surface — manages:
 *   - The dithered background
 *   - The icon grid (right column, stacked vertically)
 *   - All open windows
 *   - The global drag outline overlay
 *   - Click-to-deselect icons
 */
export default function Desktop() {
  const windows = useWindowManager((s) => s.windows);
  const openWindow = useWindowManager((s) => s.openWindow);
  const settings = useWindowManager((s) => s.settings);

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  // Deselect all icons when clicking the bare desktop
  function handleDesktopClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).dataset.iconId) return;
    setSelectedIconId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setSelectedIconId(null);
  }

  const handleOpenIcon = useCallback(
    (iconId: string) => {
      if (iconId === "trash") return; // Trash is decorative for now

      // Section windows (about, resume, contact)
      if (iconId in SECTION_WINDOWS) {
        const config = SECTION_WINDOWS[iconId as keyof typeof SECTION_WINDOWS];
        // Center dialog windows on open
        if (config.type === "dialog") {
          const centeredConfig = {
            ...config,
            x: Math.max(20, Math.floor((window.innerWidth - config.width) / 2)),
            y: Math.max(28, Math.floor((window.innerHeight - config.height) / 2)),
          };
          openWindow(centeredConfig);
          return;
        }
        openWindow(config);
        return;
      }

      // Project windows
      const project = PROJECTS.find((p) => p.id === iconId);
      if (project) {
        openWindow({
          id: project.id,
          title: project.title,
          type: project.type,
          contentId: project.id,
          ...project.window,
        });
      }
    },
    [openWindow],
  );

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--menu-bar-height)",
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
      onClick={handleDesktopClick}
      onKeyDown={handleKeyDown}
      className={settings.scanlines ? "scanlines" : ""}
      aria-label="Desktop"
      role="main"
    >
      <DesktopPattern />

      {/* Icon column — right side of desktop, stacked vertically */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: "var(--z-icons)",
        }}
        role="list"
        aria-label="Desktop icons"
      >
        {DESKTOP_ICONS.map((icon) => (
          <div key={icon.id} role="listitem">
            <DesktopIcon
              id={icon.id}
              label={icon.label}
              iconName={icon.icon}
              isSelected={selectedIconId === icon.id}
              onSelect={() => setSelectedIconId(icon.id)}
              onOpen={() => handleOpenIcon(icon.id)}
            />
          </div>
        ))}
      </div>

      {/* All open windows */}
      {windows.map((win) => (
        <WindowRenderer key={win.id} win={win} />
      ))}

      {/* Global drag outline — rendered above everything except the menu bar */}
      <DragOutline />
    </div>
  );
}

// ── Window content router ─────────────────────────────────────────────────────

function WindowRenderer({ win }: { win: WindowState }) {
  if (win.type === "finder") {
    return <FinderWindow win={win} />;
  }

  if (win.type === "dialog") {
    return <DialogWindow win={win} />;
  }

  if (win.type === "canvas") {
    return <CanvasWindow win={win} repoUrl={getProject(win.contentId)?.repoUrl} />;
  }

  if (win.type === "terminal") {
    const project = getProject(win.contentId);
    return (
      <TerminalWindow
        win={win}
        session={project?.terminalSession ?? []}
        repoUrl={project?.repoUrl}
      />
    );
  }

  if (win.type === "application") {
    const project = getProject(win.contentId);
    return (
      <ApplicationWindow
        win={win}
        url={project?.url ?? "about:blank"}
        repoUrl={project?.repoUrl}
      />
    );
  }

  // Default: document window
  const content = getDocumentContent(win.contentId);
  return <DocumentWindow win={win} content={content} />;
}

function getProject(contentId: string) {
  return PROJECTS.find((p) => p.id === contentId);
}

function getDocumentContent(contentId: string): string {
  if (contentId === "about") return ABOUT_CONTENT;
  const project = getProject(contentId);
  return project?.writeup ?? `# ${contentId}\n\nContent coming soon.`;
}
