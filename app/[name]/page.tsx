import type { Metadata } from "next";
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
  const { prediction, language, name: prettyName } = getPrediction(safeName, lang);

  const title =
    language === "bn"
      ? `${prettyName} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী 😂`
      : `${prettyName}'s Married Life Prediction 😂`;

  const ogImageUrl = `/api/og?name=${encodeURIComponent(safeName)}${lang ? `&lang=${lang}` : ""}`;

  return {
    title,
    description: prediction,
    openGraph: {
      title,
      description: prediction,
      url: `/${encodeURIComponent(safeName)}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
      type: "website",
      siteName: "After Marriage Prediction",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: prediction,
      images: [ogImageUrl],
    },
    other: {
      "fb:app_id": "",
    },
  };
}

export default async function NamePage({ params, searchParams }: PageProps) {
  const { name: rawName } = await params;
  const { lang } = await searchParams;
  const safeName = sanitizeName(rawName);
  const { prediction, language, name: prettyName } = getPrediction(safeName, lang);

  return (
    <NamePageClient
      name={prettyName}
      prediction={prediction}
      language={language}
      rawName={safeName}
    />
  );
}
