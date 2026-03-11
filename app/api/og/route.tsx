import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

/* ══════════════════════════════════════════════════════════════
   Bulletproof Bengali font loading for Vercel Lambda
   
   Problem: sharp({ text: { fontfile } }) uses Pango which needs
   fontconfig to resolve fonts. On Vercel Lambda, the bundled font
   path may not be discoverable by fontconfig, causing tofu boxes.
   
   Solution:
   1. Copy font to /tmp (guaranteed writable on Lambda)
   2. Create a fontconfig.xml pointing to /tmp
   3. Set FONTCONFIG_FILE env var before first Pango call
   4. Use fontfile + font family for belt-and-suspenders reliability
   ══════════════════════════════════════════════════════════════ */

const FONT_NAME = "NotoSansBengali-Bold.ttf";
const FONT_TMP = `/tmp/${FONT_NAME}`;
const FC_CONF = "/tmp/og-fonts.conf";

let _fontReady = false;
function ensureBnFont(): string {
  if (_fontReady) return FONT_TMP;

  // Copy font to /tmp if not already there
  if (!existsSync(FONT_TMP)) {
    const src = join(process.cwd(), "app/api/og/fonts", FONT_NAME);
    writeFileSync(FONT_TMP, readFileSync(src));
  }

  // Create fontconfig that adds /tmp as font directory
  if (!existsSync(FC_CONF)) {
    mkdirSync("/tmp/fc-cache", { recursive: true });
    writeFileSync(
      FC_CONF,
      `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>/tmp</dir>
  <cachedir>/tmp/fc-cache</cachedir>
  <match target="pattern">
    <test name="family"><string>Noto Sans Bengali</string></test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans Bengali</string>
    </edit>
  </match>
</fontconfig>`
    );
  }

  // Tell fontconfig where our config is
  process.env.FONTCONFIG_FILE = FC_CONF;
  _fontReady = true;
  return FONT_TMP;
}

/* ── Helpers ── */

/** Escape for XML / Pango markup */
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

const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
  "Content-Type": "image/png",
};

/* ══════════════════════════════════════════════════════════════
   Bengali text → transparent PNG via sharp's Pango text API.
   Uses fontfile + fontconfig for maximum compatibility.
   ══════════════════════════════════════════════════════════════ */
async function renderBnText(
  text: string,
  color: string,
  sizePt: number,
  fontPath: string,
  opts?: { width?: number; maxHeight?: number; spacing?: number; align?: string }
): Promise<Buffer> {
  let markup = `<span foreground="${color}"`;
  if (opts?.spacing) markup += ` letter_spacing="${opts.spacing}"`;
  markup += `>${esc(text)}</span>`;

  let buf = await sharp({
    text: {
      text: markup,
      fontfile: fontPath,
      font: `Noto Sans Bengali Bold ${sizePt}`,
      rgba: true,
      dpi: 72,
      ...(opts?.width ? { width: opts.width } : {}),
      ...(opts?.align ? { align: opts.align as "left" | "centre" | "right" } : {}),
    },
  })
    .png()
    .toBuffer();

  // Crop height if it exceeds maxHeight
  if (opts?.maxHeight) {
    const meta = await sharp(buf).metadata();
    if (meta.height && meta.height > opts.maxHeight) {
      buf = await sharp(buf)
        .extract({
          left: 0,
          top: 0,
          width: meta.width!,
          height: opts.maxHeight,
        })
        .png()
        .toBuffer();
    }
  }

  return buf;
}

/* ══════════════════════════════════════════════════════════════
   Stunning background SVG — shapes, gradients, decorations.
   No Bengali text here (all text composited via sharp text API).
   ══════════════════════════════════════════════════════════════ */
function buildBgSvg(predTop: number, predH: number): string {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Top accent gradient -->
    <linearGradient id="topbar" x1="0" y1="0" x2="1200" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="25%" stop-color="#a855f7"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="75%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <!-- Left prediction bar -->
    <linearGradient id="leftbar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <!-- CTA pill -->
    <linearGradient id="cta" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <!-- Brand icon -->
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <!-- Ambient glows -->
    <radialGradient id="glow1" cx="0.13" cy="0.16" r="0.45">
      <stop offset="0%" stop-color="rgba(124,58,237,0.22)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.88" cy="0.84" r="0.4">
      <stop offset="0%" stop-color="rgba(236,72,153,0.16)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow3" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="rgba(168,85,247,0.08)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <!-- Bottom fade -->
    <linearGradient id="bottomfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(124,58,237,0.06)"/>
    </linearGradient>
  </defs>

  <!-- Deep background -->
  <rect width="1200" height="630" fill="#09090b"/>

  <!-- Subtle noise texture via pattern -->
  <rect width="1200" height="630" fill="url(#bottomfade)"/>

  <!-- Ambient glow orbs -->
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect width="1200" height="630" fill="url(#glow3)"/>

  <!-- Decorative sparkle dots -->
  <circle cx="180" cy="80" r="2" fill="rgba(168,85,247,0.4)"/>
  <circle cx="220" cy="140" r="1.5" fill="rgba(236,72,153,0.3)"/>
  <circle cx="1020" cy="100" r="1.8" fill="rgba(168,85,247,0.35)"/>
  <circle cx="1080" cy="180" r="1.2" fill="rgba(236,72,153,0.25)"/>
  <circle cx="950" cy="520" r="2" fill="rgba(168,85,247,0.3)"/>
  <circle cx="300" cy="500" r="1.5" fill="rgba(236,72,153,0.2)"/>

  <!-- Top accent bar (5px rainbow gradient) -->
  <rect y="0" width="1200" height="5" fill="url(#topbar)"/>

  <!-- Bottom subtle line -->
  <rect y="625" width="1200" height="5" fill="url(#topbar)" opacity="0.3"/>

  <!-- Badge background: বিয়ের পরে -->
  <rect x="60" y="120" width="170" height="34" rx="8"
        fill="rgba(124,58,237,0.15)" stroke="rgba(139,92,246,0.25)" stroke-width="1"/>

  <!-- Left accent bar for prediction -->
  <rect x="60" y="${predTop - 8}" width="5" height="${predH + 16}" rx="3" fill="url(#leftbar)"/>

  <!-- Footer: Brand icon -->
  <rect x="60" y="572" width="34" height="34" rx="10" fill="url(#brand)"/>
  <text x="69" y="595" font-family="sans-serif" font-size="14"
        font-weight="bold" fill="white">MP</text>
  <text x="104" y="595" font-family="sans-serif" font-size="17"
        font-weight="bold" fill="#64748b">familys.tech</text>

  <!-- CTA pill with glow -->
  <rect x="900" y="570" width="250" height="40" rx="20" fill="url(#cta)"
        filter="drop-shadow(0 4px 12px rgba(124,58,237,0.3))"/>

  <!-- Decorative corner accents -->
  <line x1="1140" y1="30" x2="1170" y2="30" stroke="rgba(168,85,247,0.2)" stroke-width="1"/>
  <line x1="1170" y1="30" x2="1170" y2="60" stroke="rgba(168,85,247,0.2)" stroke-width="1"/>
  <line x1="30" y1="600" x2="30" y2="570" stroke="rgba(236,72,153,0.15)" stroke-width="1"/>
  <line x1="30" y1="600" x2="60" y2="600" stroke="rgba(236,72,153,0.15)" stroke-width="1"/>
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

    const nameLen = prettyName.length;
    const nameSize = nameLen > 16 ? 48 : nameLen > 10 ? 56 : 64;

    /* ── Bengali path: sharp text API (Pango + HarfBuzz + fontconfig) ── */
    if (isBn) {
      const fontPath = ensureBnFont();
      const len = clean.length;
      const pSize = len > 200 ? 22 : len > 140 ? 25 : len > 90 ? 28 : 32;

      // 1. Render name (large, white, bold)
      const nameImg = await renderBnText(prettyName, "white", nameSize, fontPath, {
        width: 1050,
      });

      // 2. Render badge "বিয়ের পরে"
      const badgeImg = await renderBnText(
        "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7",
        "#c4b5fd",
        14,
        fontPath,
        { spacing: 3000 }
      );

      // 3. Render prediction text (auto-wrapped by Pango at width)
      const predImg = await renderBnText(
        `\u201C${clean}\u201D`,
        "#e2e8f0",
        pSize,
        fontPath,
        { width: 1040, maxHeight: 340 }
      );
      const predMeta = await sharp(predImg).metadata();
      const predH = predMeta.height || 100;
      const predTop = Math.max(185, Math.floor(360 - predH / 2));

      // 4. Render CTA "তোমার নাম দিয়ে দেখো"
      const ctaImg = await renderBnText(
        "\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB",
        "white",
        16,
        fontPath
      );

      // 5. Build stunning background SVG + composite all text layers
      const bgSvg = buildBgSvg(predTop, predH);
      const pngBuffer = await sharp(Buffer.from(bgSvg))
        .resize(1200, 630)
        .composite([
          { input: nameImg, top: 40, left: 60 },
          { input: badgeImg, top: 126, left: 72 },
          { input: predImg, top: predTop, left: 84 },
          { input: ctaImg, top: 578, left: 920 },
        ])
        .png({ compressionLevel: 6 })
        .toBuffer();

      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: CACHE_HEADERS,
      });
    }

    /* ── English path: Satori / next-og (fast, works perfectly) ── */
    // Truncate for English OG card (Satori handles wrapping but keep reasonable)
    const enMaxLen = 200;
    const text =
      clean.length > enMaxLen
        ? clean.substring(0, enMaxLen) + "\u2026"
        : clean;
    const pSize = text.length > 120 ? 26 : text.length > 80 ? 30 : 34;

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
