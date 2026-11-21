"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Same contract as the homepage: theme lives on <html data-theme> and in
    localStorage("theme"), so the choice carries between pages. */
export function useSiteTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.dataset.theme === "light" ? "light" : "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  return theme;
}

export function ThemeToggle() {
  const theme = useSiteTheme();

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  return (
    <button className="b-theme" onClick={toggle} aria-label="Toggle color theme">
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}

/** Runs before paint so a saved light theme doesn't flash dark first. */
export const themeBootScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
