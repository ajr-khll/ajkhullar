import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/markdown";

/* Each post is src/content/blog/<slug>.md, served at /blog/<slug>.
   Its images live in public/blog/<slug>/ and are referenced Obsidian-style
   (![[folder/file.png]]); only the filename is used.
   Frontmatter `play: arpeggio` adds a "Play against Arpeggio" button that
   links to /blog/<slug>/play. */

const CONTENT = path.join(process.cwd(), "src/content/blog");
const PUBLIC = path.join(process.cwd(), "public/blog");

export function loadPost(slug: string) {
  const file = path.join(CONTENT, `${slug}.md`);
  if (!/^[\w-]+$/.test(slug) || !fs.existsSync(file)) return null;
  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const assetDir = path.join(PUBLIC, slug);
  const assets = fs.existsSync(assetDir) ? fs.readdirSync(assetDir) : [];
  return { title: data.title ?? slug, date: data.date, play: data.play, body, assets };
}

export function postSlugs() {
  return fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
}
