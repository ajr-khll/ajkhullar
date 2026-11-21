import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle, themeBootScript } from "@/components/blog/theme";
import "./blog.css";

// Unlisted: reachable by link only. Nothing on the site links here, and search
// engines are asked not to index or follow it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blog">
      <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />

      <header className="b-top">
        <div className="b-crumbs">
          <Link href="/" className="b-home">
            AJ Khullar
          </Link>
          <span className="b-sep">/</span>
          <span className="b-section">blog</span>
        </div>
        <ThemeToggle />
      </header>

      {children}

      <footer className="b-site-footer">© ajkhullar</footer>
    </div>
  );
}
