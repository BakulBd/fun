import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

/* ── Bangla font: bundled TTF, loaded once per cold start ── */
const banglaFontData = fetch(
  new URL("./fonts/NotoSansBengali-Bold.ttf", import.meta.url)
).then((r) => r.arrayBuffer());

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("name") || "Friend";
    const lang = searchParams.get("lang");

    const safeName = sanitizeName(rawName);
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const {
      prediction,
      language,
      name: prettyName,
    } = getPrediction(safeName, lang);
    const isBn = language === "bn";

    // Strip emojis
    const clean = prediction
      .replace(
        /[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
        ""
      )
      .trim();

    const maxLen = 140;
    const text =
      clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;

    // Dynamic font size — shorter → bigger
    const pSize = text.length > 100 ? 28 : text.length > 60 ? 32 : 38;
    // Dynamic name size for very long names
    const nameSize =
      prettyName.length > 14 ? 52 : prettyName.length > 9 ? 60 : 68;

    // Build fonts array — always load Bangla for Bangla text
    const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] =
      [];
    if (isBn) {
      fonts.push({
        name: "NotoSansBengali",
        data: await banglaFontData,
        weight: 700,
        style: "normal",
      });
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0a0a0a",
            fontFamily: isBn ? "NotoSansBengali, sans-serif" : "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow effects */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-80px",
              left: "-40px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "-60px",
              right: "-30px",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Accent gradient bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "6px",
              background:
                "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #f97316, #eab308)",
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "40px 56px 28px",
              justifyContent: "space-between",
            }}
          >
            {/* Top: Name + tag */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: `${nameSize}px`,
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                }}
              >
                {prettyName}
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    padding: "5px 14px",
                    borderRadius: "6px",
                  }}
                >
                  {isBn
                    ? "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7"
                    : "AFTER MARRIAGE"}
                </div>
              </div>
            </div>

            {/* Center: Prediction */}
            <div
              style={{
                display: "flex",
                fontSize: `${pSize}px`,
                fontWeight: 700,
                color: "#e2e8f0",
                lineHeight: 1.45,
                maxWidth: "1020px",
              }}
            >
              {"\u201C"}
              {text}
              {"\u201D"}
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
              {/* Left: Logo + domain */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "white",
                  }}
                >
                  MP
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  familys.tech
                </div>
              </div>

              {/* Right: CTA */}
              <div
                style={{
                  display: "flex",
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "white",
                  padding: "9px 28px",
                  borderRadius: "50px",
                  fontSize: "17px",
                  fontWeight: 800,
                }}
              >
                {isBn
                  ? "\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB"
                  : "Try YOUR Name"}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        ...(fonts.length > 0 ? { fonts } : {}),
        headers: {
          "Cache-Control":
            "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
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
