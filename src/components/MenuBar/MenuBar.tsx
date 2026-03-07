"use client";

import { useState } from "react";
import { useWindowManager } from "@/state/windowManager";
import { SECTION_WINDOWS, PROJECTS } from "@/data/projects";
import { AppleIcon } from "@/components/icons/Icons";
import Clock from "./Clock";
import MenuDropdown, { type MenuItem } from "./MenuDropdown";

type ActiveMenu = "apple" | "file" | "view" | "links" | null;

/**
 * Fixed top menu bar — the primary navigation surface.
 *
 * Menus:
 *   🍎  — About This Site, Restart (replay boot)
 *   File — Open Resume, Contact Me
 *   View — Toggle Scanlines, Grid Snap, Sound
 *   Links — GitHub, LinkedIn, etc.
 *   [clock] — right-aligned live clock
 *
 * The File menu is the recruiter escape hatch: Resume and Contact in one click.
 */
interface MenuBarProps {
  onRestart: () => void;
}

export default function MenuBar({ onRestart }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const openWindow = useWindowManager((s) => s.openWindow);
  const settings = useWindowManager((s) => s.settings);
  const toggleSetting = useWindowManager((s) => s.toggleSetting);

  function toggleMenu(menu: ActiveMenu) {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  }

  function closeMenu() {
    setActiveMenu(null);
  }

  function openSection(id: keyof typeof SECTION_WINDOWS) {
    const config = SECTION_WINDOWS[id];
    if (config.type === "dialog") {
      openWindow({
        ...config,
        x: Math.max(20, Math.floor((window.innerWidth - config.width) / 2)),
        y: Math.max(28, Math.floor((window.innerHeight - config.height) / 2)),
      });
    } else {
      openWindow(config);
    }
  }

  // ── Menu item definitions ──────────────────────────────────────────────────

  const appleItems: MenuItem[] = [
    {
      type: "item",
      label: "About This Site",
      onClick: () => {
        openWindow({
          ...SECTION_WINDOWS.about,
          id: "about-this-site",
          title: "About This Site",
        });
      },
    },
    { type: "separator" },
    {
      type: "item",
      label: "Restart…",
      onClick: onRestart,
    },
  ];

  const fileItems: MenuItem[] = [
    {
      type: "item",
      label: "Open Resume",
      shortcut: "⌘R",
      onClick: () => openSection("resume"),
    },
    {
      type: "item",
      label: "Contact Me",
      shortcut: "⌘M",
      onClick: () => openSection("contact"),
    },
    { type: "separator" },
    {
      type: "item",
      label: "About Me",
      onClick: () => openSection("about"),
    },
    { type: "separator" },
    // Quick links to all projects
    ...PROJECTS.map((p): MenuItem => ({
      type: "item",
      label: p.title,
      onClick: () =>
        openWindow({
          id: p.id,
          title: p.title,
          type: p.type,
          contentId: p.id,
          ...p.window,
        }),
    })),
  ];

  const viewItems: MenuItem[] = [
    {
      type: "item",
      label: `${settings.scanlines ? "✓ " : "  "}Scanlines`,
      onClick: () => toggleSetting("scanlines"),
    },
    {
      type: "item",
      label: `${settings.gridSnap ? "✓ " : "  "}Grid Snap`,
      onClick: () => toggleSetting("gridSnap"),
    },
    {
      type: "item",
      label: `${settings.sound ? "✓ " : "  "}Sound Effects`,
      onClick: () => toggleSetting("sound"),
    },
  ];

  const linksItems: MenuItem[] = [
    {
      type: "item",
      label: "GitHub ↗",
      onClick: () => window.open("https://github.com/yourusername", "_blank"),
    },
    {
      type: "item",
      label: "LinkedIn ↗",
      onClick: () => window.open("https://linkedin.com/in/yourusername", "_blank"),
    },
    {
      type: "item",
      label: "Email ↗",
      onClick: () => window.open("mailto:you@example.com", "_blank"),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <nav className="menu-bar" aria-label="Menu bar">
      {/* Apple menu */}
      <div
        className={`menu-bar__item${activeMenu === "apple" ? " menu-bar__item--active" : ""}`}
        onClick={() => toggleMenu("apple")}
        aria-haspopup="true"
        aria-expanded={activeMenu === "apple"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleMenu("apple")}
        style={{ padding: "0 10px" }}
      >
        <AppleIcon size={14} />
        {activeMenu === "apple" && (
          <MenuDropdown items={appleItems} onClose={closeMenu} />
        )}
      </div>

      {/* File menu */}
      <div
        className={`menu-bar__item${activeMenu === "file" ? " menu-bar__item--active" : ""}`}
        onClick={() => toggleMenu("file")}
        aria-haspopup="true"
        aria-expanded={activeMenu === "file"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleMenu("file")}
      >
        File
        {activeMenu === "file" && (
          <MenuDropdown items={fileItems} onClose={closeMenu} />
        )}
      </div>

      {/* View menu */}
      <div
        className={`menu-bar__item${activeMenu === "view" ? " menu-bar__item--active" : ""}`}
        onClick={() => toggleMenu("view")}
        aria-haspopup="true"
        aria-expanded={activeMenu === "view"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleMenu("view")}
      >
        View
        {activeMenu === "view" && (
          <MenuDropdown items={viewItems} onClose={closeMenu} />
        )}
      </div>

      {/* Links menu */}
      <div
        className={`menu-bar__item${activeMenu === "links" ? " menu-bar__item--active" : ""}`}
        onClick={() => toggleMenu("links")}
        aria-haspopup="true"
        aria-expanded={activeMenu === "links"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleMenu("links")}
      >
        Links
        {activeMenu === "links" && (
          <MenuDropdown items={linksItems} onClose={closeMenu} />
        )}
      </div>

      <div className="menu-bar__spacer" />

      {/* Right side: clock */}
      <div className="menu-bar__right">
        <Clock />
      </div>
    </nav>
  );
}
