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

    const { prediction, language, gender, name: prettyName } = getPrediction(safeName, lang);

  // Strip emojis from prediction for cleaner OG image text
  const cleanPrediction = prediction.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").trim();

  // Truncate for display — allow more since we're showing the FULL meme
  const maxLen = 160;
  const displayPrediction =
    cleanPrediction.length > maxLen
      ? cleanPrediction.substring(0, maxLen) + "..."
      : cleanPrediction;

  const subtitle =
    language === "bn"
      ? "বিয়ের পরের ভবিষ্যদ্বাণী"
      : "After Marriage Prediction";

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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          padding: "30px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Main card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: "32px",
            padding: "36px 48px",
            maxWidth: "1100px",
            width: "100%",
            height: "100%",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(90deg, #ff6b6b, #ee5a24)",
              color: "white",
              padding: "8px 24px",
              borderRadius: "50px",
              fontSize: "20px",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            <span>🔥</span>
            <span>{subtitle}</span>
            <span>🔥</span>
          </div>

          {/* Big Name — the star of the show */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 900,
              textAlign: "center",
              background: "linear-gradient(135deg, #e056a0, #ee5a24, #f0932b)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "4px",
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            {prettyName}
          </div>

          {/* Emojis row */}
          <div
            style={{
              fontSize: "40px",
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <span>💍</span>
            <span>😂</span>
            <span>🤣</span>
            <span>💀</span>
          </div>

          {/* THE MEME — full prediction in a bold box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #fff3cd, #fce4ec, #e8eaf6)",
              borderRadius: "24px",
              padding: "24px 32px",
              width: "100%",
              border: "4px solid #f06292",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                textAlign: "center",
                color: "#1a1a2e",
                lineHeight: 1.45,
              }}
            >
              {displayPrediction}
            </div>
          </div>

          {/* Bottom CTA bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              familys.tech
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(90deg, #ec4899, #ef4444)",
                color: "white",
                padding: "8px 20px",
                borderRadius: "50px",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              <span>👆</span>
              <span>{language === "bn" ? "তোমার নাম দিয়ে দেখো!" : "Try YOUR name!"}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
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
