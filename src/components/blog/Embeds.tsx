import type { ReactNode } from "react";

/* Building blocks for a blog post. Everything here is a server component except
   the few that need the browser (Tweet, Video, live animations), which live in
   their own "use client" files. Widths: "column" sits in the text measure,
   "wide" breaks out a little, "full" runs edge to edge. */

type Width = "column" | "wide" | "full";

export function Figure({
  children,
  caption,
  width = "column",
}: {
  children: ReactNode;
  caption?: ReactNode;
  width?: Width;
}) {
  return (
    <figure className={`b-figure b-${width}`}>
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Photos and GIFs. A GIF is just an image, so both go through here. */
export function Image({
  src,
  alt,
  caption,
  width,
  ratio,
  maxWidth,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  width?: Width;
  /** e.g. "16 / 9" — reserves space so the page doesn't jump while it loads. */
  ratio?: string;
  /** Display width cap in px (Obsidian's ![[img.png|480]]). */
  maxWidth?: number;
}) {
  return (
    <Figure caption={caption} width={width}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ aspectRatio: ratio, maxWidth }}
      />
    </Figure>
  );
}

/** Any iframe embed: YouTube, Vimeo, CodePen, Figma, a Loom, a map. */
export function Embed({
  src,
  title,
  caption,
  width,
  ratio = "16 / 9",
}: {
  src: string;
  title: string;
  caption?: ReactNode;
  width?: Width;
  ratio?: string;
}) {
  return (
    <Figure caption={caption} width={width}>
      <div className="b-frame" style={{ aspectRatio: ratio }}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </Figure>
  );
}

export function YouTube({ id, title, caption, width }: { id: string; title: string; caption?: ReactNode; width?: Width }) {
  return (
    <Embed
      src={`https://www.youtube-nocookie.com/embed/${id}`}
      title={title}
      caption={caption}
      width={width}
    />
  );
}

export function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <pre className="b-code" data-lang={lang}>
      <code>{children.trim()}</code>
    </pre>
  );
}
