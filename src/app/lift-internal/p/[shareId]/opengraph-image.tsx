import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { getPresetSharePreview } from "@/lib/lift-preset-share";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lift preset";

const FONTS_DIR = join(process.cwd(), "src/app/lift-internal/p/[shareId]/fonts");

// Mirrors src/constants/theme.ts and the Card / AppText components from the
// Lift app repo — keep in sync if that design system changes.
const colors = {
  background: "#0B0B0F",
  card: "#111116",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#F4F4F6",
  textSoft: "rgba(244, 244, 246, 0.78)",
  textMuted: "rgba(244, 244, 246, 0.5)",
  textSubtle: "rgba(244, 244, 246, 0.32)",
  primarySoft: "#e3b271",
  chip: "rgba(11, 11, 15, 0.7)",
};

// gradients.primaryAction from theme.ts: colors ['#3B1554', '#AD5353', '#FFD103'],
// locations [0, 0.68, 1] — the same gradient behind the app's "Start workout" button.
const primaryActionGradient = "linear-gradient(90deg, #3B1554 0%, #AD5353 68%, #FFD103 100%)";

const MAX_ROWS = 4;

export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const [preview, montserratSemibold, montserratBold, brawlerRegular, brawlerBold] = await Promise.all([
    getPresetSharePreview(shareId),
    readFile(join(FONTS_DIR, "Montserrat_600SemiBold.ttf")),
    readFile(join(FONTS_DIR, "Montserrat_700Bold.ttf")),
    readFile(join(FONTS_DIR, "Brawler_400Regular.ttf")),
    readFile(join(FONTS_DIR, "Brawler_700Bold.ttf")),
  ]);

  const rows = preview?.exerciseNames.slice(0, MAX_ROWS) ?? [];
  const remaining = preview ? preview.exerciseNames.length - rows.length : 0;

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
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 72px 48px",
          }}
        >
          <div
            style={{
              color: colors.primarySoft,
              display: "flex",
              fontFamily: "Brawler",
              fontSize: 22,
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            LIFT · SHARED PRESET
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: colors.text,
                display: "flex",
                fontFamily: "Montserrat",
                fontSize: preview && preview.name.length > 24 ? 54 : 72,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 22,
                maxWidth: 1000,
              }}
            >
              {preview ? preview.name : "This preset link is no longer available"}
            </div>

            {rows.length > 0 ? (
              <div
                style={{
                  background: colors.card,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  paddingLeft: 24,
                  paddingRight: 24,
                }}
              >
                {rows.map((exerciseName, index) => (
                  <div
                    key={exerciseName + index}
                    style={{
                      alignItems: "center",
                      borderBottom:
                        index === rows.length - 1 && remaining <= 0
                          ? "none"
                          : `2px solid ${colors.border}`,
                      display: "flex",
                      height: 56,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        color: colors.textSubtle,
                        display: "flex",
                        fontFamily: "Brawler",
                        fontSize: 22,
                        marginRight: 22,
                        width: 36,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div style={{ color: colors.textSoft, display: "flex", fontFamily: "Montserrat", fontSize: 26 }}>
                      {exerciseName}
                    </div>
                  </div>
                ))}
                {remaining > 0 ? (
                  <div style={{ alignItems: "center", display: "flex", height: 56, width: "100%" }}>
                    <div style={{ color: colors.textMuted, display: "flex", fontFamily: "Brawler", fontSize: 22 }}>
                      +{remaining} more
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div
              style={{
                color: colors.textMuted,
                display: "flex",
                fontFamily: "Brawler",
                fontSize: 20,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {preview
                ? `${preview.exerciseNames.length} exercise${preview.exerciseNames.length === 1 ? "" : "s"}`
                : "Coming soon, to an app store near you"}
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
              <div
                style={{
                  color: colors.text,
                  display: "flex",
                  fontFamily: "Montserrat",
                  fontSize: 26,
                  fontWeight: 600,
                  marginRight: 20,
                }}
              >
                Open in Lift
              </div>
              <div
                style={{
                  alignItems: "center",
                  background: colors.chip,
                  borderRadius: 8,
                  display: "flex",
                  height: 48,
                  justifyContent: "center",
                  width: 48,
                }}
              >
                <div style={{ color: colors.text, display: "flex", fontFamily: "Montserrat", fontSize: 26, fontWeight: 700 }}>
                  &#8250;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: montserratSemibold, weight: 600, style: "normal" },
        { name: "Montserrat", data: montserratBold, weight: 700, style: "normal" },
        { name: "Brawler", data: brawlerRegular, weight: 400, style: "normal" },
        { name: "Brawler", data: brawlerBold, weight: 700, style: "normal" },
      ],
    },
  );
}
