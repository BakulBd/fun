import { NextRequest, NextResponse } from "next/server";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

/* ══════════════════════════════════════════════════════════════
   Bulletproof font loading for Vercel Lambda
   
   Problem: sharp({ text: { fontfile } }) uses Pango which needs
   fontconfig to resolve fonts. On Vercel Lambda, the bundled font
   path may not be discoverable by fontconfig, causing tofu boxes.
   
   Solution:
   1. Copy BOTH fonts to /tmp (guaranteed writable on Lambda)
   2. Create a fontconfig.xml pointing to /tmp
   3. Set FONTCONFIG_FILE env var before first Pango call
   4. Use fontfile + font family for belt-and-suspenders reliability
   ══════════════════════════════════════════════════════════════ */

const BN_FONT = "NotoSansBengali-Bold.ttf";
const EN_FONT = "Inter-Bold.ttf";
const BN_TMP = `/tmp/${BN_FONT}`;
const EN_TMP = `/tmp/${EN_FONT}`;
const FC_CONF = "/tmp/og-fonts.conf";

let _fontsReady = false;
function ensureFonts(): { bn: string; en: string } {
  if (_fontsReady) return { bn: BN_TMP, en: EN_TMP };

  const fontSrc = join(process.cwd(), "app/api/og/fonts");

  if (!existsSync(BN_TMP)) writeFileSync(BN_TMP, readFileSync(join(fontSrc, BN_FONT)));
  if (!existsSync(EN_TMP)) writeFileSync(EN_TMP, readFileSync(join(fontSrc, EN_FONT)));

  if (!existsSync(FC_CONF)) {
    mkdirSync("/tmp/fc-cache", { recursive: true });
    writeFileSync(
      FC_CONF,
      `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>/tmp</dir>
  <cachedir>/tmp/fc-cache</cachedir>
</fontconfig>`
    );
  }

  process.env.FONTCONFIG_FILE = FC_CONF;
  _fontsReady = true;
  return { bn: BN_TMP, en: EN_TMP };
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
   Text → transparent PNG via sharp's Pango text API.
   Uses fontfile + fontconfig for maximum compatibility.
   Works for both Bengali (Noto Sans Bengali) and English (Inter).
   ══════════════════════════════════════════════════════════════ */
async function renderText(
  text: string,
  color: string,
  sizePt: number,
  fontPath: string,
  fontFamily: string,
  opts?: { width?: number; maxHeight?: number; spacing?: number; align?: string }
): Promise<Buffer> {
  let markup = `<span foreground="${color}"`;
  if (opts?.spacing) markup += ` letter_spacing="${opts.spacing}"`;
  markup += `>${esc(text)}</span>`;

  let buf = await sharp({
    text: {
      text: markup,
      fontfile: fontPath,
      font: `${fontFamily} Bold ${sizePt}`,
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

    /* ── Both paths use sharp text API (Pango + HarfBuzz + fontconfig) ── */
    const fonts = ensureFonts();
    const fontPath = isBn ? fonts.bn : fonts.en;
    const fontFamily = isBn ? "Noto Sans Bengali" : "Inter";

    const len = clean.length;
    const pSize = isBn
      ? (len > 200 ? 22 : len > 140 ? 25 : len > 90 ? 28 : 32)
      : (len > 120 ? 26 : len > 80 ? 30 : 34);

    // Truncate English if too long
    const predText = !isBn && len > 200
      ? clean.substring(0, 200) + "\u2026"
      : clean;

    // 1. Render name (large, white, bold)
    const nameImg = await renderText(prettyName, "white", nameSize, fontPath, fontFamily, {
      width: 1050,
    });

    // 2. Render badge text
    const badgeText = isBn
      ? "\u09AC\u09BF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09C7"
      : "AFTER MARRIAGE";
    const badgeImg = await renderText(
      badgeText,
      "#c4b5fd",
      isBn ? 14 : 13,
      fontPath,
      fontFamily,
      { spacing: isBn ? 3000 : 4000 }
    );

    // 3. Render prediction text (auto-wrapped by Pango at width)
    const predImg = await renderText(
      `\u201C${predText}\u201D`,
      "#e2e8f0",
      pSize,
      fontPath,
      fontFamily,
      { width: 1040, maxHeight: 340 }
    );
    const predMeta = await sharp(predImg).metadata();
    const predH = predMeta.height || 100;
    const predTop = Math.max(185, Math.floor(360 - predH / 2));

    // 4. Render CTA text
    const ctaText = isBn
      ? "\u09A4\u09CB\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0996\u09CB"
      : "Try YOUR Name";
    const ctaImg = await renderText(
      ctaText,
      "white",
      16,
      fontPath,
      fontFamily
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
  } catch (e) {
    console.error("OG image generation error:", e);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
