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

  // Viral clickbait OG title — makes people WANT to click
  const ogTitle =
    language === "bn"
      ? `😂 ${prettyName} কে নিয়ে মিম বানানো হয়েছে!`
      : `😂 ${prettyName} just got roasted!`;

  // Teaser description — don't spoil the joke, create curiosity
  const ogDescription =
    language === "bn"
      ? `কেউ ${prettyName} এর বিয়ের পরের ভবিষ্যৎ নিয়ে মিম বানিয়েছে 🤣 ক্লিক করে দেখো!`
      : `Someone made a meme about ${prettyName}'s married life 🤣 Click to see it!`;

  // Page title (shown in browser tab) — includes the actual prediction
  const pageTitle =
    language === "bn"
      ? `${prettyName} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী 😂`
      : `${prettyName}'s Married Life Prediction 😂`;

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
