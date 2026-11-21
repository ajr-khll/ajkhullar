import type { ReactNode } from "react";
import { Code, Image, YouTube } from "@/components/blog/Embeds";
import { Video } from "@/components/blog/Motion";
import { Tweet } from "@/components/blog/Tweet";

/* A small markdown renderer for blog posts written in Obsidian.

   Blocks:  #–###### headings, paragraphs, - / 1. lists, > quotes, ``` code,
            --- rules, and media on a line of their own:
              ![[file.png]]  ![[file.png|480]]  ![alt](url)   (images, GIFs, .mp4)
              https://x.com/user/status/123                    (tweet)
              https://youtube.com/watch?v=… / youtu.be/…        (video embed)
            An *italic line* right after media becomes its caption.
   Inline:  *em* _em_ **strong** `code` [text](url) and \-escapes.
   Notes:   text[^id] with a "[^id]: note" line anywhere; numbered in order
            of first reference and listed at the end of the post.

   Obsidian embeds resolve against `assetBase`; a .png with a sibling .svg of
   the same name is served as the .svg (sharper diagrams, smaller files). */

export type Frontmatter = Record<string, string>;

export function parseFrontmatter(src: string): { data: Frontmatter; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src };
  const data: Frontmatter = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { data, body: src.slice(m[0].length) };
}

type Options = {
  /** Public URL prefix for ![[embeds]], e.g. "/blog/arpeggio". */
  assetBase: string;
  /** Names of files that exist under assetBase (used for the .svg upgrade). */
  assets?: string[];
};

const IMAGE_EMBED = /^!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/;
const IMAGE_MD = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const TWEET = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/\w+\/status\/\d+\S*$/;
const YT = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})\S*$/;
const CAPTION = /^(?:\*([^*].*)\*|_([^_].*)_)$/;

type Notes = { defs: Map<string, string>; order: string[] };

const NOTE_DEF = /^\[\^([^\]]+)\]:\s*(.*)$/;

export function renderMarkdown(src: string, opts: Options): ReactNode[] {
  const notes: Notes = { defs: new Map(), order: [] };
  const lines = src
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => {
      const d = l.trim().match(NOTE_DEF);
      if (d) notes.defs.set(d[1], d[2]);
      return !d;
    });
  const inline = (text: string) => renderInline(text, notes);
  const out: ReactNode[] = [];
  let i = 0;
  const key = () => out.length;

  const resolve = (path: string) => {
    if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
    let file = path.split("/").pop()!;
    const svg = file.replace(/\.png$/i, ".svg");
    if (svg !== file && opts.assets?.includes(svg)) file = svg;
    return `${opts.assetBase}/${file}`;
  };

  const takeCaption = (): ReactNode | undefined => {
    const m = lines[i]?.trim().match(CAPTION);
    if (!m) return undefined;
    i++;
    return inline(m[1] ?? m[2]);
  };

  const media = (url: string, alt: string, width?: string) => {
    const caption = takeCaption();
    if (/\.(mp4|webm|mov)$/i.test(url)) {
      out.push(<Video key={key()} src={url} caption={caption} />);
    } else {
      out.push(
        <Image
          key={key()}
          src={url}
          alt={alt}
          caption={caption}
          maxWidth={width ? Number(width) : undefined}
        />,
      );
    }
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    // ``` fenced code
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || undefined;
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
      i++;
      out.push(
        <Code key={key()} lang={lang}>
          {body.join("\n")}
        </Code>,
      );
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      i++;
      // The post title is the page's h1, so headings in the body start at h2.
      const H = h[1].length <= 3 ? "h2" : "h3";
      out.push(<H key={key()}>{inline(h[2])}</H>);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      i++;
      out.push(<hr key={key()} />);
      continue;
    }

    let m;
    if ((m = line.match(IMAGE_EMBED))) {
      i++;
      media(resolve(m[1]), m[1].split("/").pop()!.replace(/\.\w+$/, ""), m[2]);
      continue;
    }
    if ((m = line.match(IMAGE_MD))) {
      i++;
      media(resolve(m[2]), m[1]);
      continue;
    }
    if (TWEET.test(line)) {
      i++;
      out.push(<Tweet key={key()} url={line} />);
      continue;
    }
    if ((m = line.match(YT))) {
      i++;
      out.push(<YouTube key={key()} id={m[1]} title="YouTube video" caption={takeCaption()} />);
      continue;
    }

    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">"))
        body.push(lines[i++].trim().replace(/^>\s?/, ""));
      out.push(<blockquote key={key()}>{inline(body.join(" "))}</blockquote>);
      continue;
    }

    const ordered = /^\d+\.\s/.test(line);
    if (ordered || /^[-*+]\s/.test(line)) {
      const marker = ordered ? /^\d+\.\s+/ : /^[-*+]\s+/;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i].trim()))
        items.push(lines[i++].trim().replace(marker, ""));
      const L = ordered ? "ol" : "ul";
      out.push(
        <L key={key()}>
          {items.map((t, j) => (
            <li key={j}>{inline(t)}</li>
          ))}
        </L>,
      );
      continue;
    }

    // Paragraph: runs until a blank line or the start of another block.
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (
        !l ||
        l.startsWith("```") ||
        /^#{1,6}\s/.test(l) ||
        IMAGE_EMBED.test(l) ||
        IMAGE_MD.test(l) ||
        (para.length > 0 && (l.startsWith(">") || /^([-*+]|\d+\.)\s/.test(l)))
      )
        break;
      para.push(l);
      i++;
    }
    out.push(<p key={key()}>{inline(para.join(" "))}</p>);
  }

  if (notes.order.length) {
    out.push(
      <ol className="b-notes" key={key()}>
        {notes.order.map((id, j) => (
          <li key={id} id={`fn-${j + 1}`}>
            {inline(notes.defs.get(id) ?? "")}{" "}
            <a href={`#fnref-${j + 1}`} aria-label="Back to text">
              ↩
            </a>
          </li>
        ))}
      </ol>,
    );
  }

  return out;
}

const INLINE =
  /\[\^([^\]]+)\]|\\([!-\/:-@[-`{-~])|`([^`]+)`|\*\*(.+?)\*\*|\*([^*\s](?:.*?[^*\s])?)\*|(?<![\w])_([^_\s](?:.*?[^_\s])?)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string, notes: Notes): ReactNode[] {
  const inline = (t: string) => renderInline(t, notes);
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index! > last) nodes.push(text.slice(last, m.index));
    const [, note, esc, code, strong, em1, em2, linkText, href] = m;
    if (note !== undefined && notes.defs.has(note)) {
      let n = notes.order.indexOf(note) + 1;
      if (!n) n = notes.order.push(note);
      nodes.push(
        <sup className="b-fn" key={k++} id={`fnref-${n}`}>
          <a href={`#fn-${n}`}>{n}</a>
        </sup>,
      );
    } else if (note !== undefined) nodes.push(m[0]);
    else if (esc !== undefined) nodes.push(esc);
    else if (code !== undefined) nodes.push(<code key={k++}>{code}</code>);
    else if (strong !== undefined) nodes.push(<strong key={k++}>{inline(strong)}</strong>);
    else if (em1 !== undefined || em2 !== undefined)
      nodes.push(<em key={k++}>{inline(em1 ?? em2)}</em>);
    else if (linkText !== undefined) {
      const external = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={k++}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {inline(linkText)}
        </a>,
      );
    }
    last = m.index! + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
