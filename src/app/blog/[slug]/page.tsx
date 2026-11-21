import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseFrontmatter, renderMarkdown } from "@/lib/markdown";

/* Each post is src/content/blog/<slug>.md, served at /blog/<slug>.
   Its images live in public/blog/<slug>/ and are referenced Obsidian-style
   (![[folder/file.png]]); only the filename is used. */

const CONTENT = path.join(process.cwd(), "src/content/blog");
const PUBLIC = path.join(process.cwd(), "public/blog");

function load(slug: string) {
  const file = path.join(CONTENT, `${slug}.md`);
  if (!/^[\w-]+$/.test(slug) || !fs.existsSync(file)) return null;
  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const assetDir = path.join(PUBLIC, slug);
  const assets = fs.existsSync(assetDir) ? fs.readdirSync(assetDir) : [];
  return { title: data.title ?? slug, date: data.date, body, assets };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.slice(0, -3) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = load((await params).slug);
  return post ? { title: `${post.title} — AJ Khullar` } : {};
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = load(slug);
  if (!post) notFound();

  return (
    <article className="b-post">
      <header>
        <h1 className="b-title">{post.title}</h1>
        {post.date && (
          <time className="b-date" dateTime={post.date}>
            {post.date}
          </time>
        )}
      </header>

      <div className="b-body">
        {renderMarkdown(post.body, { assetBase: `/blog/${slug}`, assets: post.assets })}
      </div>
    </article>
  );
}
