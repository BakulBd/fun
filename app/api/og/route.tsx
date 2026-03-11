import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

/* ── Bengali font: Hind Siliguri Bold (251 KB) ──
   Bundled at build time → zero runtime network calls.
   Registered for weights 400, 700, 900 so Satori never falls back to system
   font for Bengali glyphs. */
const bnFontData = fetch(
  new URL("./fonts/HindSiliguri-Bold.ttf", import.meta.url)
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

    const maxLen = 130;
    const text =
      clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;

    // Dynamic sizing
    const pSize = text.length > 100 ? 28 : text.length > 60 ? 32 : 36;
    const nameLen = prettyName.length;
    const nameSize = nameLen > 16 ? 48 : nameLen > 10 ? 56 : 64;

    // Build fonts — register Bengali font for ALL weights so Satori always uses it
    const fonts: {
      name: string;
      data: ArrayBuffer;
      weight: 400 | 700 | 900;
      style: "normal";
    }[] = [];

    if (isBn) {
      const fd = await bnFontData;
      fonts.push(
        { name: "BN", data: fd, weight: 400, style: "normal" },
        { name: "BN", data: fd, weight: 700, style: "normal" },
        { name: "BN", data: fd, weight: 900, style: "normal" }
      );
    }

    const fontFamily = isBn ? "BN, sans-serif" : "sans-serif";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0a0a0a",
            fontFamily,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top-left glow */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-100px",
              left: "-60px",
              width: "420px",
              height: "420px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            }}
          />
          {/* Bottom-right glow */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "-80px",
              right: "-40px",
              width: "380px",
              height: "380px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            }}
          />

          {/* Gradient accent bar */}
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
              padding: "40px 56px 30px",
              justifyContent: "space-between",
            }}
          >
            {/* Header: Name + Badge */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: `${nameSize}px`,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  fontFamily,
                }}
              >
                {prettyName}
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    background: "rgba(124,58,237,0.2)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    padding: "5px 16px",
                    borderRadius: "6px",
                    fontFamily,
                  }}
                >
                  {isBn
                    ? "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7"
                    : "AFTER MARRIAGE"}
                </div>
              </div>
            </div>

            {/* Prediction text */}
            <div
              style={{
                display: "flex",
                fontSize: `${pSize}px`,
                fontWeight: 700,
                color: "#e2e8f0",
                lineHeight: 1.5,
                maxWidth: "1020px",
                fontFamily,
              }}
            >
              {"\u201C"}
              {text}
              {"\u201D"}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {/* Brand */}
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
                    background:
                      "linear-gradient(135deg, #7c3aed, #ec4899)",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 700,
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

              {/* CTA */}
              <div
                style={{
                  display: "flex",
                  background:
                    "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "white",
                  padding: "9px 26px",
                  borderRadius: "50px",
                  fontSize: "16px",
                  fontWeight: 700,
                  fontFamily,
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
        fonts: fonts.length > 0 ? fonts : undefined,
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
