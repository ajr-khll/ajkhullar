import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { getPresetSharePreview } from "@/lib/lift-preset-share";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lift preset";

const FONTS_DIR = join(process.cwd(), "src/app/lift-internal/p/[shareId]/fonts");

// Mirrors src/constants/theme.ts (colors, gradients) from the Lift app repo —
// keep in sync if that palette changes.
const colors = {
  background: "#0B0B0F",
  text: "#F4F4F6",
  textSoft: "rgba(244, 244, 246, 0.78)",
  textMuted: "rgba(244, 244, 246, 0.5)",
  primary: "#d18726",
  chip: "rgba(11, 11, 15, 0.7)",
};

// gradients.primaryAction from theme.ts: colors ['#3B1554', '#AD5353', '#FFD103'],
// locations [0, 0.68, 1], a left-to-right gradient (start/end share y=0.5).
const primaryActionGradient = "linear-gradient(90deg, #3B1554 0%, #AD5353 68%, #FFD103 100%)";

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
          background: colors.background,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <div style={{ background: primaryActionGradient, display: "flex", height: 10, width: "100%" }} />

        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            fontFamily: "Montserrat",
            justifyContent: "space-between",
            padding: "56px 72px 64px",
          }}
        >
          <div
            style={{
              color: colors.primary,
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
                color: colors.text,
                display: "flex",
                fontSize: preview && preview.name.length > 24 ? 60 : 80,
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
                  color: colors.textSoft,
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 600,
                  marginTop: 26,
                  maxWidth: 1000,
                }}
              >
                {exercisePreview}
              </div>
            ) : null}
          </div>

          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ color: colors.textMuted, display: "flex", fontSize: 22, fontWeight: 600 }}>
              {preview ? `${preview.exerciseNames.length} exercises · Shared from Lift` : "Coming soon, to an app store near you"}
            </div>

            <div
              style={{
                alignItems: "center",
                background: primaryActionGradient,
                borderRadius: 18,
                display: "flex",
                height: 68,
                justifyContent: "space-between",
                paddingLeft: 26,
                paddingRight: 10,
              }}
            >
              <div style={{ color: colors.text, display: "flex", fontSize: 26, fontWeight: 700, marginRight: 20 }}>
                Open in Lift
              </div>
              <div
                style={{
                  alignItems: "center",
                  background: colors.chip,
                  borderRadius: 12,
                  display: "flex",
                  height: 48,
                  justifyContent: "center",
                  width: 48,
                }}
              >
                <div style={{ color: colors.text, display: "flex", fontSize: 26, fontWeight: 700 }}>&#8250;</div>
              </div>
            </div>
          </div>
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
