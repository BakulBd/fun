import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

/* ── Bengali font: Noto Sans Bengali Bold (142 KB) ──
   Static TTF with full Bengali conjunct / ligature support.
   Bundled at build time → zero runtime network calls.
   .slice(0) on each registration so Satori never detaches a shared buffer. */
const bnFontPromise = fetch(
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

    const maxLen = 130;
    const text =
      clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;

    // Dynamic sizing
    const pSize = text.length > 100 ? 28 : text.length > 60 ? 32 : 36;
    const nameLen = prettyName.length;
    const nameSize = nameLen > 16 ? 48 : nameLen > 10 ? 56 : 64;

    /* ── Font registration ──
       For Bengali: register NotoSansBengali-Bold for weights 400 / 700 / 900.
       Each entry gets its OWN ArrayBuffer copy via .slice(0) to prevent
       Satori from detaching a shared buffer after parsing the first one. */
    const fonts: {
      name: string;
      data: ArrayBuffer;
      weight: 400 | 700 | 900;
      style: "normal";
    }[] = [];

    if (isBn) {
      const buf = await bnFontPromise;
      fonts.push(
        { name: "BN", data: buf.slice(0), weight: 400, style: "normal" },
        { name: "BN", data: buf.slice(0), weight: 700, style: "normal" },
        { name: "BN", data: buf.slice(0), weight: 900, style: "normal" }
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
          {/* ── Ambient glow: purple top-left ── */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-120px",
              left: "-80px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
            }}
          />
          {/* ── Ambient glow: pink bottom-right ── */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "-100px",
              right: "-60px",
              width: "460px",
              height: "460px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 70%)",
            }}
          />
          {/* ── Subtle center glow ── */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "180px",
              left: "400px",
              width: "400px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
            }}
          />

          {/* ── Rainbow accent bar (top) ── */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "5px",
              background:
                "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #f97316, #eab308)",
            }}
          />

          {/* ── Main content ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "44px 60px 32px",
              justifyContent: "space-between",
            }}
          >
            {/* Header: Name + badge */}
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
              <div style={{ display: "flex", marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    padding: "6px 18px",
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

            {/* ── Prediction text with left accent line ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "20px",
                maxWidth: "1060px",
              }}
            >
              {/* Decorative left bar */}
              <div
                style={{
                  display: "flex",
                  width: "4px",
                  minHeight: "60px",
                  height: "100%",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(180deg, #a855f7, #ec4899)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: `${pSize}px`,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  lineHeight: 1.55,
                  fontFamily,
                }}
              >
                {"\u201C"}
                {text}
                {"\u201D"}
              </div>
            </div>

            {/* ── Footer ── */}
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
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
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
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  familys.tech
                </div>
              </div>

              {/* CTA pill */}
              <div
                style={{
                  display: "flex",
                  background:
                    "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white",
                  padding: "10px 28px",
                  borderRadius: "50px",
                  fontSize: "16px",
                  fontWeight: 700,
                  fontFamily,
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
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
