import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawName = searchParams.get("name") || "Friend";
  const lang = searchParams.get("lang");

  const safeName = sanitizeName(rawName);
  const { prediction, language, name: prettyName } = getPrediction(safeName, lang);

  const title =
    language === "bn"
      ? `${prettyName} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী`
      : `${prettyName}'s Married Life Prediction`;

  // Truncate prediction if too long for the image
  const maxPredictionLength = 120;
  const displayPrediction =
    prediction.length > maxPredictionLength
      ? prediction.substring(0, maxPredictionLength) + "..."
      : prediction;

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
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 25%, #f0932b 50%, #e056a0 75%, #8e44ad 100%)",
          padding: "40px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Outer card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.97)",
            borderRadius: "30px",
            padding: "45px 55px",
            maxWidth: "1080px",
            width: "100%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            border: "4px solid rgba(255,255,255,0.6)",
          }}
        >
          {/* Emoji header */}
          <div
            style={{
              fontSize: "55px",
              marginBottom: "8px",
              display: "flex",
              gap: "12px",
            }}
          >
            <span>💍</span>
            <span>😂</span>
            <span>🤣</span>
            <span>💒</span>
          </div>

          {/* Big Name */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              textAlign: "center",
              color: "#e056a0",
              marginBottom: "6px",
              letterSpacing: "-1px",
            }}
          >
            {prettyName}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              textAlign: "center",
              color: "#6b7280",
              marginBottom: "22px",
            }}
          >
            {title}
          </div>

          {/* Prediction box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #fff9c4, #fce4ec, #e8eaf6)",
              borderRadius: "20px",
              padding: "28px 36px",
              width: "100%",
              border: "3px dashed #f06292",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                textAlign: "center",
                color: "#1f2937",
                lineHeight: 1.5,
              }}
            >
              &ldquo;{displayPrediction}&rdquo;
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#9ca3af",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>Just for fun! • After Marriage Prediction Generator</span>
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
}
