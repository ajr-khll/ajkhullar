"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useSiteTheme } from "./theme";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: Element) => void } };
  }
}

const SCRIPT_SRC = "https://platform.twitter.com/widgets.js";

/** Embeds a post from X/Twitter. Renders a readable blockquote first (which is
    what shows if the script is blocked), then widgets.js upgrades it in place. */
export function Tweet({
  url,
  children,
  author,
  date,
}: {
  /** Full post URL, e.g. https://x.com/jack/status/20 */
  url: string;
  /** Optional fallback text, shown if the script is blocked. */
  children?: ReactNode;
  author?: string;
  date?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useSiteTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const render = () => window.twttr?.widgets?.load(el);

    if (window.twttr?.widgets) {
      render();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", render);
    return () => script?.removeEventListener("load", render);
  }, [url, theme]);

  // twitter.com URLs are what widgets.js matches on.
  const href = url.replace("://x.com/", "://twitter.com/");

  return (
    // Keyed on theme: widgets.js swaps the blockquote for an iframe once, so a
    // theme change needs a fresh blockquote to re-render from.
    <div className="b-tweet" ref={ref} key={theme}>
      <blockquote className="twitter-tweet" data-dnt="true" data-theme={theme} data-conversation="none">
        {children && <p>{children}</p>}
        {author && <>&mdash; {author} </>}
        <a href={href}>{date ?? href}</a>
      </blockquote>
    </div>
  );
}
