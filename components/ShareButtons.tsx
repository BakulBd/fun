"use client";

import { useState } from "react";

interface ShareButtonsProps {
  name: string;
  prediction: string;
  language: "en" | "bn";
}

export default function ShareButtons({
  name,
  prediction,
  language,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const title =
    language === "bn"
      ? `${name} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী`
      : `${name}'s Married Life Prediction`;

  const shareText = `${title}\n\n"${prediction}"`;

  const handleFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const handleWhatsApp = () => {
    const waText = `${shareText}\n\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(waText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleMessenger = () => {
    const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
    const webFallback = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=&redirect_uri=${encodeURIComponent(url)}`;
    const win = window.open(messengerUrl);
    setTimeout(() => {
      if (!win || win.closed) {
        window.open(webFallback, "_blank", "width=600,height=500,noopener,noreferrer");
      }
    }, 500);
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400,noopener,noreferrer"
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    const encodedName = encodeURIComponent(name.toLowerCase());
    const langParam = language === "bn" ? "&lang=bn" : "";
    const imageUrl = `/api/og?name=${encodedName}${langParam}`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name}-marriage-prediction.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const buttonBase =
    "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-sm md:text-base";

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      <button onClick={handleFacebook} className={`${buttonBase} bg-[#1877F2]`}>
        Facebook
      </button>
      <button onClick={handleWhatsApp} className={`${buttonBase} bg-[#25D366]`}>
        WhatsApp
      </button>
      <button onClick={handleMessenger} className={`${buttonBase} bg-[#0084FF]`}>
        Messenger
      </button>
      <button onClick={handleTwitter} className={`${buttonBase} bg-[#1DA1F2]`}>
        Twitter
      </button>
      <button onClick={handleCopy} className={`${buttonBase} bg-linear-to-r from-green-500 to-emerald-500`}>
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button onClick={handleDownload} className={`${buttonBase} bg-linear-to-r from-orange-500 to-amber-500`}>
        Download
      </button>
    </div>
  );
}
