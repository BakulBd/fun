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

    const maxLen = 140;
    const displayPrediction =
      cleanPrediction.length > maxLen
        ? cleanPrediction.substring(0, maxLen) + "..."
        : cleanPrediction;

    const subtitle =
      language === "bn" ? "বিয়ের পরের ভবিষ্যদ্বাণী" : "After Marriage Prediction";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "24px",
              padding: "40px 52px",
              maxWidth: "1080px",
              width: "100%",
              height: "100%",
            }}
          >
            {/* Subtitle */}
            <div
              style={{
                display: "flex",
                fontSize: "20px",
                fontWeight: 700,
                color: "#7c3aed",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              {subtitle}
            </div>

            {/* Name */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: 900,
                color: "#1e1b4b",
                textAlign: "center",
                lineHeight: 1.1,
                marginBottom: "20px",
              }}
            >
              {prettyName}
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                width: "80px",
                height: "4px",
                background: "linear-gradient(90deg, #7c3aed, #c026d3)",
                borderRadius: "2px",
                marginBottom: "20px",
              }}
            />

            {/* Prediction text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f3ff",
                borderRadius: "16px",
                padding: "24px 32px",
                width: "100%",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  textAlign: "center",
                  color: "#1e1b4b",
                  lineHeight: 1.5,
                }}
              >
                &ldquo;{displayPrediction}&rdquo;
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginTop: "16px",
              }}
            >
              <div style={{ fontSize: "18px", color: "#6b7280", fontWeight: 600 }}>
                familys.tech
              </div>
              <div
                style={{
                  display: "flex",
                  background: "#7c3aed",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "50px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {language === "bn" ? "তোমার নাম দিয়ে দেখো" : "Try YOUR name"}
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
