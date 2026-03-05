"use client";

import Window from "@/components/Window/Window";
import type { WindowState } from "@/state/windowManager";

interface DocumentWindowProps {
  win: WindowState;
  /** Plain text or simple markup. Paragraphs split on double-newline. */
  content: string;
  title?: string;
}

/**
 * A SimpleText-style scrollable document window.
 *
 * Content is plain text with minimal structure:
 *   - Lines starting with ## become <h2>
 *   - Lines starting with - become list items (grouped into <ul>)
 *   - Blank lines separate paragraphs
 *   - Back-tick spans become <code>
 */
export default function DocumentWindow({ win, content }: DocumentWindowProps) {
  return (
    <Window win={win}>
      <div className="document-body sys7-scroll selectable">
        {renderContent(content)}
      </div>
    </Window>
  );
}

// ── Content renderer ─────────────────────────────────────────────────────────

function renderContent(text: string): React.ReactNode[] {
  const blocks = text.split(/\n{2,}/);
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    if (block.startsWith("# ")) {
      nodes.push(<h1 key={i}>{block.slice(2)}</h1>);
    } else if (block.startsWith("## ")) {
      nodes.push(<h2 key={i}>{block.slice(3)}</h2>);
    } else if (block.split("\n").every((l) => l.startsWith("- "))) {
      // List block
      const items = block.split("\n").map((l) => l.slice(2));
      nodes.push(
        <ul key={i}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
    } else {
      // Normal paragraph — may span multiple lines
      nodes.push(<p key={i}>{renderInline(block.replace(/\n/g, " "))}</p>);
    }
  }

  return nodes;
}

/** Render inline backtick code spans. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/`([^`]+)`/);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    i % 2 === 1 ? <code key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{part}</code> : part,
  );
}
