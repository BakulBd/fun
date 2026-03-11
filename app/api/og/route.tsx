import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

/* ── Bengali font: Noto Sans Bengali Bold (142 KB) ──
   Static TTF with full conjunct / ligature support.
   Loaded lazily via readFileSync, cached as base64 for SVG embedding.
   outputFileTracingIncludes in next.config.ts ensures Vercel bundles it. */
let _bnFontBase64: string | undefined;
function getBnFontBase64(): string {
  if (!_bnFontBase64) {
    const buf = readFileSync(
      join(process.cwd(), "app/api/og/fonts/NotoSansBengali-Bold.ttf")
    );
    _bnFontBase64 = buf.toString("base64");
  }
  return _bnFontBase64;
}

/* ── Helpers ── */

/** XML-escape text for safe SVG embedding */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip emojis */
function stripEmoji(s: string): string {
  return s
    .replace(
      /[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
      ""
    )
    .trim();
}

/** Word-wrap text to fit a given character width */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length + w.length + 1 > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
  "Content-Type": "image/png",
};

/* ══════════════════════════════════════════════════════════════
   Bengali OG — rendered via sharp (SVG → PNG)
   Uses Pango + HarfBuzz for perfect conjunct / matra shaping.
   ══════════════════════════════════════════════════════════════ */
function buildBengaliSvg(
  prettyName: string,
  text: string,
  nameSize: number,
  pSize: number,
  fontB64: string
): string {
  const lines = wrapText(text, pSize > 30 ? 42 : 50);
  const lineHeight = pSize * 1.6;

  // Dynamic vertical centering for prediction block
  const predBlockHeight = lines.length * lineHeight;
  const predStartY = Math.max(260, 330 - predBlockHeight / 2);

  const predLines = lines
    .map(
      (line, i) =>
        `<text x="84" y="${predStartY + i * lineHeight}" font-family="BN, sans-serif" font-size="${pSize}" font-weight="bold" fill="#e2e8f0">${i === 0 ? "\u201C" : ""}${esc(line)}${i === lines.length - 1 ? "\u201D" : ""}</text>`
    )
    .join("\n    ");

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'BN';
        src: url(data:font/truetype;base64,${fontB64}) format('truetype');
        font-weight: bold;
      }
    </style>
    <linearGradient id="accent" x1="0" y1="0" x2="1200" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="30%" stop-color="#a855f7"/>
      <stop offset="60%" stop-color="#ec4899"/>
      <stop offset="85%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="leftbar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0" cy="0" r="1">
      <stop offset="0%" stop-color="rgba(124,58,237,0.18)"/>
      <stop offset="70%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="1" cy="1" r="1">
      <stop offset="0%" stop-color="rgba(236,72,153,0.13)"/>
      <stop offset="70%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0a0a0a"/>

  <!-- Ambient glows -->
  <circle cx="160" cy="100" r="250" fill="url(#glow1)"/>
  <circle cx="1060" cy="530" r="230" fill="url(#glow2)"/>

  <!-- Top accent bar -->
  <rect y="0" width="1200" height="5" fill="url(#accent)"/>

  <!-- Name -->
  <text x="60" y="${nameSize + 44}" font-family="BN, sans-serif" font-size="${nameSize}" font-weight="bold" fill="white">${esc(prettyName)}</text>

  <!-- Badge: বিয়ের পরে -->
  <rect x="60" y="${nameSize + 60}" width="160" height="32" rx="6" fill="rgba(124,58,237,0.18)" stroke="rgba(139,92,246,0.3)" stroke-width="1"/>
  <text x="72" y="${nameSize + 82}" font-family="BN, sans-serif" font-size="14" font-weight="bold" fill="#c4b5fd" letter-spacing="3">\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7</text>

  <!-- Left accent bar for prediction -->
  <rect x="60" y="${predStartY - pSize}" width="4" height="${predBlockHeight + 10}" rx="2" fill="url(#leftbar)"/>

  <!-- Prediction text -->
  ${predLines}

  <!-- Footer: Brand -->
  <rect x="60" y="574" width="32" height="32" rx="8" fill="url(#brand)"/>
  <text x="68" y="596" font-family="sans-serif" font-size="13" font-weight="bold" fill="white">MP</text>
  <text x="102" y="596" font-family="sans-serif" font-size="17" font-weight="bold" fill="#64748b">familys.tech</text>

  <!-- CTA pill -->
  <rect x="920" y="572" width="230" height="38" rx="19" fill="url(#cta)"/>
  <text x="944" y="598" font-family="BN, sans-serif" font-size="16" font-weight="bold" fill="white">\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB</text>
</svg>`;
}

/* ══════════════════════════════════════════════════════════════
   Main Handler
   ══════════════════════════════════════════════════════════════ */
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

    const clean = stripEmoji(prediction);
    const maxLen = 130;
    const text =
      clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;

    const nameLen = prettyName.length;
    const nameSize = nameLen > 16 ? 48 : nameLen > 10 ? 56 : 64;
    const pSize = text.length > 100 ? 28 : text.length > 60 ? 32 : 36;

    /* ── Bengali path: sharp SVG → PNG (HarfBuzz text shaping) ── */
    if (isBn) {
      const fontB64 = getBnFontBase64();
      const svg = buildBengaliSvg(prettyName, text, nameSize, pSize, fontB64);
      const pngBuffer = await sharp(Buffer.from(svg))
        .resize(1200, 630)
        .png({ compressionLevel: 6 })
        .toBuffer();

      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: CACHE_HEADERS,
      });
    }

    /* ── English path: Satori / next-og (fast, works perfectly) ── */
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0a0a0a",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow: purple top-left */}
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
          {/* Ambient glow: pink bottom-right */}
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
          {/* Subtle center glow */}
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

          {/* Top accent bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "5px",
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
              padding: "44px 60px 32px",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: `${nameSize}px`,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
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
                  }}
                >
                  AFTER MARRIAGE
                </div>
              </div>
            </div>

            {/* Prediction text with left accent */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "20px",
                maxWidth: "1060px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "4px",
                  minHeight: "60px",
                  height: "100%",
                  borderRadius: "4px",
                  background: "linear-gradient(180deg, #a855f7, #ec4899)",
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
                }}
              >
                {"\u201C"}
                {text}
                {"\u201D"}
              </div>
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
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
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

              <div
                style={{
                  display: "flex",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white",
                  padding: "10px 28px",
                  borderRadius: "50px",
                  fontSize: "16px",
                  fontWeight: 700,
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                }}
              >
                Try YOUR Name
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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
