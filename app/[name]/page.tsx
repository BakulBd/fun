import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sanitizeName } from "@/lib/sanitize";
import { getPrediction } from "@/lib/get-prediction";
import NamePageClient from "./client";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { name: rawName } = await params;
  const { lang } = await searchParams;
  const safeName = sanitizeName(rawName);

  if (!safeName) {
    return { title: "Not Found" };
  }

  const cookieStore = await cookies();
  const geoLang = cookieStore.get("geo-lang")?.value;
  const { prediction, language, gender, name: prettyName } = getPrediction(safeName, lang, geoLang);

  // Strip emojis from prediction for clean OG title
  const cleanPrediction = prediction
    .replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .trim();

  // OG title = the actual prediction meme — this is what shows on Facebook/social
  const ogTitle =
    cleanPrediction.length > 90
      ? cleanPrediction.substring(0, 87) + "..."
      : cleanPrediction;

  // Description with CTA
  const ogDescription =
    language === "bn"
      ? `${prettyName} এর বিয়ের পরের ভবিষ্যদ্বাণী! তোমার নাম দিয়েও দেখো — familys.tech`
      : `${prettyName}'s after-marriage prediction! Try YOUR name too — familys.tech`;

  // Page title (shown in browser tab)
  const pageTitle =
    language === "bn"
      ? `${prettyName} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী`
      : `${prettyName}'s Married Life Prediction`;

  const ogImageUrl = `/api/og?name=${encodeURIComponent(safeName)}${lang ? `&lang=${lang}` : ""}`;

  return {
    title: pageTitle,
    description: prediction,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `/${encodeURIComponent(safeName)}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
          type: "image/png",
        },
      ],
      type: "website",
      siteName: "After Marriage Prediction",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function NamePage({ params, searchParams }: PageProps) {
  const { name: rawName } = await params;
  const { lang } = await searchParams;
  const safeName = sanitizeName(rawName);

  // If name is empty after sanitization, show 404
  if (!safeName) {
    notFound();
  }

  const cookieStore = await cookies();
  const geoLang = cookieStore.get("geo-lang")?.value;
  const { prediction, language, name: prettyName } = getPrediction(safeName, lang, geoLang);

  return (
    <NamePageClient
      name={prettyName}
      prediction={prediction}
      language={language}
      rawName={safeName}
    />
  );
}
