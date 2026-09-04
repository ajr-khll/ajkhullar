import type { Metadata } from "next";

import { getPresetSharePreview } from "@/lib/lift-preset-share";

type PageProps = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const preview = await getPresetSharePreview(shareId);

  const title = preview ? `${preview.name} · Lift` : "Lift";
  const description = preview
    ? `${preview.exerciseNames.length} exercise${preview.exerciseNames.length === 1 ? "" : "s"} · Shared from Lift`
    : "Coming soon, to an app store near you.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/p/${shareId}`,
      siteName: "Lift",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PresetShareRoute({ params }: PageProps) {
  const { shareId } = await params;
  const preview = await getPresetSharePreview(shareId);

  return (
    <main
      style={{
        alignItems: "center",
        background: "#0B0B0F",
        color: "#F4F4F6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {preview ? (
        <>
          <p
            style={{
              color: "#d18726",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Shared preset
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 600, margin: "0.5rem 0 0" }}>
            {preview.name}
          </h1>
          <p style={{ color: "rgba(244, 244, 246, 0.78)", fontSize: "0.9rem", margin: "0.75rem 0 0" }}>
            {preview.exerciseNames.join(" · ")}
          </p>
        </>
      ) : (
        <h1 style={{ fontSize: "2rem", fontWeight: 600, margin: 0 }}>
          This preset link is no longer available
        </h1>
      )}
      <p style={{ fontSize: "0.875rem", margin: "2rem 0 0", opacity: 0.6 }}>
        Lift is coming soon, to an app store near you.
      </p>
    </main>
  );
}
