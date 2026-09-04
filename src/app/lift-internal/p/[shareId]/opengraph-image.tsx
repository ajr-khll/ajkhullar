import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { getPresetSharePreview } from "@/lib/lift-preset-share";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lift preset";

const FONTS_DIR = join(process.cwd(), "src/app/lift-internal/p/[shareId]/fonts");

export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const [preview, semibold, bold] = await Promise.all([
    getPresetSharePreview(shareId),
    readFile(join(FONTS_DIR, "Montserrat_600SemiBold.ttf")),
    readFile(join(FONTS_DIR, "Montserrat_700Bold.ttf")),
  ]);

  const exercisePreview = preview
    ? preview.exerciseNames.slice(0, 5).join("  ·  ") +
      (preview.exerciseNames.length > 5 ? `  ·  +${preview.exerciseNames.length - 5} more` : "")
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "#0B0B0F",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Montserrat",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#d18726",
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          LIFT
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#F4F4F6",
              display: "flex",
              fontSize: preview && preview.name.length > 24 ? 64 : 84,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {preview ? preview.name : "This preset link is no longer available"}
          </div>
          {exercisePreview ? (
            <div
              style={{
                color: "rgba(244, 244, 246, 0.78)",
                display: "flex",
                fontSize: 30,
                fontWeight: 600,
                marginTop: 28,
                maxWidth: 1000,
              }}
            >
              {exercisePreview}
            </div>
          ) : null}
        </div>
        <div
          style={{
            color: "rgba(244, 244, 246, 0.5)",
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {preview ? `${preview.exerciseNames.length} exercises · Shared from Lift` : "Coming soon, to an app store near you"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: semibold, weight: 600, style: "normal" },
        { name: "Montserrat", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
