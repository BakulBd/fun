import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Detect visitor's country via Vercel geo headers
 * and set a `geo-lang` cookie so the app can auto-select language.
 *
 * Vercel automatically provides `x-vercel-ip-country` header.
 * Bangladesh (BD) → "bn", everything else → "en".
 *
 * South Asian countries that may prefer Bangla content:
 * BD = Bangladesh
 */
const BANGLA_COUNTRIES = new Set(["BD"]);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only set cookie if not already present (respect user's manual choice)
  const existingLang = request.cookies.get("geo-lang")?.value;
  if (existingLang) return response;

  // Read Vercel's geo header
  const country = request.headers.get("x-vercel-ip-country") || "";
  const detectedLang = BANGLA_COUNTRIES.has(country.toUpperCase()) ? "bn" : "en";

  // Set cookie for 30 days — lightweight, no redirect needed
  response.cookies.set("geo-lang", detectedLang, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    httpOnly: false, // Client-side needs to read it
  });

  return response;
}

export const config = {
  // Run on all pages except static assets and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
