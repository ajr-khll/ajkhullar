"use client";

import { useState } from "react";
import Window from "@/components/Window/Window";
import type { WindowState } from "@/state/windowManager";
import { RESUME_DATA } from "@/data/projects";

interface FinderWindowProps {
  win: WindowState;
}

type Section = "work" | "education" | "skills";

const FOLDERS: { id: Section; label: string; emoji: string }[] = [
  { id: "work",      label: "Work",      emoji: "💼" },
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "skills",    label: "Skills",    emoji: "⚙️" },
];

/**
 * Finder-style resume window with a two-panel layout:
 *   Left:  folder list (Work / Education / Skills)
 *   Right: item list → click an item to see details
 *
 * Styled as a classic System 7 Finder window with toolbar, sidebar, and
 * status bar.
 */
export default function FinderWindow({ win }: FinderWindowProps) {
  const [activeSection, setActiveSection] = useState<Section>("work");
  const [activeItemId, setActiveItemId] = useState<string | null>(
    RESUME_DATA.work[0]?.id ?? null,
  );

  const items = getItems(activeSection);
  const detail = getDetail(activeSection, activeItemId);

  function handleSectionChange(section: Section) {
    setActiveSection(section);
    // Auto-select first item in new section
    const first = getItems(section)[0];
    setActiveItemId(first?.id ?? null);
  }

  return (
    <Window win={win}>
      {/* View-mode toolbar */}
      <div className="finder-toolbar">
        <span style={{ fontSize: "var(--font-size-small)", color: "#555", marginRight: 8 }}>
          View:
        </span>
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            className={`sys7-btn finder-toolbar__btn${activeSection === f.id ? " finder-toolbar__btn--active" : ""}`}
            onClick={() => handleSectionChange(f.id)}
            aria-pressed={activeSection === f.id}
          >
            {f.emoji} {f.label}
          </button>
        ))}

        {/* Download PDF — right-aligned */}
        <div style={{ flex: 1 }} />
        <a
          href="/resume.pdf"
          download
          className="sys7-btn"
          style={{ textDecoration: "none", fontSize: "var(--font-size-small)" }}
        >
          ↓ Download PDF
        </a>
      </div>

      {/* Two-panel layout */}
      <div className="finder-pane sys7-scroll" style={{ overflow: "hidden" }}>
        {/* Left sidebar — item list */}
        <div className="finder-sidebar sys7-scroll">
          {items.map((item) => (
            <div
              key={item.id}
              className={`finder-sidebar__item${activeItemId === item.id ? " finder-sidebar__item--active" : ""}`}
              onClick={() => setActiveItemId(item.id)}
              role="option"
              aria-selected={activeItemId === item.id}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveItemId(item.id)}
            >
              <span>📄</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right panel — detail view */}
        <div className="finder-main sys7-scroll selectable">
          {detail ? <DetailView detail={detail} section={activeSection} /> : (
            <p style={{ color: "#888", fontStyle: "italic" }}>Select an item.</p>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="finder-status">
        <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
    </Window>
  );
}

// ── Data helpers ──────────────────────────────────────────────────────────────

interface ListItem { id: string; label: string; }

function getItems(section: Section): ListItem[] {
  if (section === "work") {
    return RESUME_DATA.work.map((w) => ({ id: w.id, label: `${w.role} @ ${w.company}` }));
  }
  if (section === "education") {
    return RESUME_DATA.education.map((e) => ({ id: e.id, label: `${e.degree}` }));
  }
  return RESUME_DATA.skills.map((s) => ({ id: s.id, label: s.category }));
}

function getDetail(section: Section, id: string | null) {
  if (!id) return null;
  if (section === "work") return RESUME_DATA.work.find((w) => w.id === id);
  if (section === "education") return RESUME_DATA.education.find((e) => e.id === id);
  return RESUME_DATA.skills.find((s) => s.id === id);
}

// ── Detail renderers ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetailView({ detail, section }: { detail: any; section: Section }) {
  if (section === "work") {
    return (
      <div style={{ lineHeight: 1.6 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>{detail.role}</div>
        <div style={{ marginBottom: 2 }}>{detail.company} — {detail.location}</div>
        <div style={{ color: "#666", marginBottom: 10, fontSize: "var(--font-size-small)" }}>{detail.period}</div>
        <div style={{ marginBottom: 8 }}>{detail.description}</div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {detail.bullets.map((b: string, i: number) => (
            <li key={i} style={{ marginBottom: 4 }}>{b}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (section === "education") {
    return (
      <div style={{ lineHeight: 1.6 }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>{detail.degree}</div>
        <div style={{ marginBottom: 2 }}>{detail.school}</div>
        <div style={{ color: "#666", marginBottom: 10, fontSize: "var(--font-size-small)" }}>{detail.period}</div>
        {detail.notes && <div>{detail.notes}</div>}
      </div>
    );
  }

  // Skills
  return (
    <div style={{ lineHeight: 1.6 }}>
      <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 8 }}>{detail.category}</div>
      <div className="tag-row">
        {detail.items.map((item: string) => (
          <span key={item} className="tag">{item}</span>
        ))}
      </div>
    </div>
  );
}
