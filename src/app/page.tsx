"use client";

import { useEffect, useState } from "react";

// Left-column links. Add/remove freely — order is preserved.
const links = [
  { label: "GitHub", href: "https://github.com/ajr-khll" },
  { label: "LinkedIn", href: "https://linkedin.com/in/aj-khullar" },
  { label: "Email", href: "mailto:arjunkhu@usc.edu" },
];

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Restore saved theme on mount.
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  // Reflect theme on <html> so CSS variables switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <main className="page">
      <header className="masthead">
        <h1 className="name">AJ Khullar</h1>
        <p className="tagline">CS @ USC · Systems + Performance</p>

        <nav className="links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle color theme"
      >
        {theme === "light" ? "☾" : "☀"}
      </button>

      {/* ─── ASCII animation goes here ───────────────────────────── */}
      <div className="stage">
        <pre id="ascii-art" className="ascii-art" aria-hidden="true">
          {/* replace with your ASCII animation */}
        </pre>
      </div>

      <footer className="footer">
        <span className="copyright">© ajkhullar</span>
      </footer>
    </main>
  );
}
