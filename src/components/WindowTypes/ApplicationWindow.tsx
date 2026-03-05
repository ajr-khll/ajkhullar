"use client";

import { useState } from "react";
import Window from "@/components/Window/Window";
import type { WindowState } from "@/state/windowManager";

interface ApplicationWindowProps {
  win: WindowState;
  url: string;
  repoUrl?: string;
}

/**
 * An iframe-based project window.
 *
 * Renders the live project inside the window content area. Shows a loading
 * state until the iframe fires its onLoad event. Provides an "open in new
 * tab" link for the full-screen experience.
 */
export default function ApplicationWindow({
  win,
  url,
  repoUrl,
}: ApplicationWindowProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Window win={win}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          borderBottom: "1px solid #000",
          background: "var(--color-gray-light)",
          fontSize: "var(--font-size-small)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#555",
          }}
        >
          {url}
        </span>
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sys7-btn"
            style={{ textDecoration: "none", fontSize: "var(--font-size-small)" }}
          >
            GitHub ↗
          </a>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="sys7-btn"
          style={{ textDecoration: "none", fontSize: "var(--font-size-small)" }}
        >
          Open ↗
        </a>
      </div>

      {/* Loading indicator */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: "29px 0 0 0", // below toolbar
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            gap: 12,
            fontSize: "var(--font-size-ui)",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 24 }}>⏳</div>
          <div>Loading…</div>
          {/* Progress bar approximation */}
          <div
            style={{
              width: 160,
              height: 8,
              border: "1px solid #000",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#000",
                animation: "progress-fill 1.5s ease-in-out infinite",
                transformOrigin: "left",
              }}
            />
          </div>
        </div>
      )}

      {/* The project itself */}
      <iframe
        src={url}
        title={win.title}
        style={{
          flex: 1,
          border: "none",
          width: "100%",
          display: "block",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      <style>{`
        @keyframes progress-fill {
          0%   { transform: scaleX(0); }
          50%  { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </Window>
  );
}
