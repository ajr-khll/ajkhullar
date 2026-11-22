import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayArpeggio } from "@/components/blog/PlayArpeggio";
import { loadPost, postSlugs } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return postSlugs()
    .filter((slug) => loadPost(slug)?.play === "arpeggio")
    .map((slug) => ({ slug }));
}

export const metadata: Metadata = { title: "Play against Arpeggio — AJ Khullar" };

export default async function Play({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = loadPost(slug);
  if (post?.play !== "arpeggio") notFound();

  return (
    <main className="b-post b-play-page">
      <header>
        <h1 className="b-title">Arpeggio 1.0.15</h1>
        <p className="b-play-intro">
          Thinking time capped to 1 second
        </p>
      </header>
      <PlayArpeggio />
      <Link href={`/blog/${slug}`} className="b-back">
        ← back to the article
      </Link>
    </main>
  );
}
