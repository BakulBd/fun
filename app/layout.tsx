import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fun-marriage.vercel.app";
// Ensure URL is clean — no trailing slash, valid format
const siteUrl = rawUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "After Marriage Prediction Generator 😂 | Funny Meme Generator",
  description:
    "Generate hilarious after-marriage predictions for any name! Share funny meme-style predictions with friends on social media. Supports Bangla & English!",
  keywords: [
    "marriage prediction",
    "funny meme generator",
    "after marriage",
    "viral meme",
    "bangla meme",
    "funny predictions",
    "biye prediction",
    "বিয়ে prediction",
  ],
  openGraph: {
    title: "After Marriage Prediction Generator 😂",
    description: "Generate hilarious after-marriage predictions for any name! Share with friends! 🤣",
    type: "website",
    siteName: "After Marriage Prediction",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "After Marriage Prediction Generator 😂",
    description: "Generate hilarious after-marriage predictions for any name!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
