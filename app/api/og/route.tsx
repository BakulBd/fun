import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";

export const runtime = "edge";

/* ---------- Bangla font – cached across warm Edge instances ---------- */
let banglaFontCache: ArrayBuffer | null = null;

async function loadBanglaFont(): Promise<ArrayBuffer | null> {
  if (banglaFontCache) return banglaFontCache;
  try {
    const css = await (
      await fetch(
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@700"
      )
    ).text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    banglaFontCache = await (await fetch(url)).arrayBuffer();
    return banglaFontCache;
  } catch {
    return null;
  }
}

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
    const isBn = language === "bn";

    // Strip emojis for clean rendering
    const clean = prediction
      .replace(
        /[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
        ""
      )
      .trim();

    const maxLen = 140;
    const text =
      clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;

    // Dynamic font size — shorter text gets bigger font
    const pSize = text.length > 100 ? 28 : text.length > 60 ? 32 : 36;

    // Load Bangla font only when needed
    const fonts: {
      name: string;
      data: ArrayBuffer;
      weight: 700;
      style: "normal";
    }[] = [];
    if (isBn) {
      const fd = await loadBanglaFont();
      if (fd)
        fonts.push({ name: "Bangla", data: fd, weight: 700, style: "normal" });
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(145deg, #160a2e 0%, #0f0f0f 40%, #0f0f0f 60%, #0b1520 100%)",
            fontFamily: isBn ? "Bangla, sans-serif" : "sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Vivid gradient accent bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "8px",
              background:
                "linear-gradient(90deg, #7c3aed, #ec4899, #f97316, #eab308)",
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "44px 56px 32px",
              justifyContent: "space-between",
            }}
          >
            {/* Name + label */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "68px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-1px",
                }}
              >
                {prettyName}
              </div>
              <div style={{ display: "flex", marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    background: "rgba(124,58,237,0.15)",
                    padding: "6px 16px",
                    borderRadius: "6px",
                  }}
                >
                  {isBn ? "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7" : "AFTER MARRIAGE"}
                </div>
              </div>
            </div>

            {/* Prediction */}
            <div
              style={{
                display: "flex",
                fontSize: `${pSize}px`,
                fontWeight: 700,
                color: "#e2e8f0",
                lineHeight: 1.4,
                maxWidth: "1020px",
              }}
            >
              {"\u201C"}{text}{"\u201D"}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background:
                      "linear-gradient(135deg, #7c3aed, #ec4899)",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 900,
                    color: "white",
                  }}
                >
                  MP
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  familys.tech
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  background:
                    "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "white",
                  padding: "10px 32px",
                  borderRadius: "50px",
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                {isBn ? "\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB" : "Try YOUR Name"}
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
