import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { loadPost, postSlugs } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = loadPost((await params).slug);
  return post ? { title: `${post.title} — AJ Khullar` } : {};
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = loadPost(slug);
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

      {post.play === "arpeggio" && (
        <Link href={`/blog/${slug}/play`} className="b-play-fab">
          <svg viewBox="0 0 16 10" aria-hidden="true">
            <path d="M1.5 1v5h12.5M11 3l3 3-3 3" />
          </svg>
          Play against Arpeggio
        </Link>
      )}
    </article>
  );
}
