import type { Metadata } from "next";
import Script from "next/script";
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
    images: [
      {
        url: "/api/og?name=Friend",
        width: 1200,
        height: 630,
        alt: "After Marriage Prediction Generator",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "After Marriage Prediction Generator 😂",
    description: "Generate hilarious after-marriage predictions for any name!",
    images: ["/api/og?name=Friend"],
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

        {/* Microsoft Clarity Analytics */}
        <Script
          id="clarity-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vu952y7s8x");
            `,
          }}
        />
      </body>
    </html>
  );
}
