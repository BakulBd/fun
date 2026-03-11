import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("name") || "Friend";
    const lang = searchParams.get("lang");

    const safeName = sanitizeName(rawName);
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const { prediction, language, name: prettyName } = getPrediction(safeName, lang);

    // Strip emojis for clean rendering
    const cleanPrediction = prediction
      .replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
      .trim();

    const maxLen = 120;
    const displayPrediction =
      cleanPrediction.length > maxLen
        ? cleanPrediction.substring(0, maxLen) + "..."
        : cleanPrediction;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0f0f0f",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent gradient bar at top */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "6px",
              background: "linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b)",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "48px 60px 36px",
              justifyContent: "space-between",
            }}
          >
            {/* Top: Name */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "72px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                }}
              >
                {prettyName}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#a78bfa",
                  marginTop: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                {language === "bn" ? "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7" : "AFTER MARRIAGE"}
              </div>
            </div>

            {/* Center: Prediction */}
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                fontWeight: 700,
                color: "#e2e8f0",
                lineHeight: 1.4,
                maxWidth: "1000px",
              }}
            >
              \u201C{displayPrediction}\u201D
            </div>

            {/* Bottom: Branding */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "white",
                  }}
                >
                  MP
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#94a3b8" }}>
                  familys.tech
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  background: "#7c3aed",
                  color: "white",
                  padding: "10px 28px",
                  borderRadius: "50px",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                {language === "bn" ? "\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB" : "Try YOUR name"}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
        },
      }
    );
  } catch (e) {
    console.error("OG image generation error:", e);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
