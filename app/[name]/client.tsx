"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PredictionCard from "@/components/PredictionCard";
import ShareButtons from "@/components/ShareButtons";
import Footer from "@/components/Footer";

interface NamePageClientProps {
  name: string;
  prediction: string;
  language: "en" | "bn";
  rawName: string;
}

export default function NamePageClient({
  name,
  prediction,
  language,
  rawName,
}: NamePageClientProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleTryNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    router.push(`/${encodeURIComponent(trimmed.toLowerCase())}`);
    setNewName("");
    setShowInput(false);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-5xl mb-3">💍</span>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            {language === "bn"
              ? "বিবাহিত জীবনের ভবিষ্যদ্বাণী"
              : "Married Life Prediction"}
          </h1>
        </div>

        {/* Prediction Card */}
        <PredictionCard
          name={name}
          prediction={prediction}
          language={language}
        />

        {/* Share Buttons */}
        <ShareButtons
          name={name}
          prediction={prediction}
          language={language}
        />

        {/* Tag friends CTA */}
        <div className="text-center mt-6">
          <p className="text-lg font-bold text-pink-500">
            {language === "bn"
              ? "বন্ধুদের Tag করো এবং তাদের prediction দেখাও!"
              : "Share this with your friends and see their reaction!"}
          </p>
        </div>

        {/* Try Another Name — inline input */}
        <div className="max-w-lg mx-auto mt-8">
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              {language === "bn"
                ? "বন্ধুর নাম লিখো — তার ভবিষ্যৎ দেখো!"
                : "Type a Friend's Name — See Their Future!"}
            </button>
          ) : (
            <form onSubmit={handleTryNew} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    language === "bn"
                      ? "বন্ধুর নাম লিখো... (যেমন: রাকিব)"
                      : "Type your friend's name..."
                  }
                  maxLength={50}
                  autoFocus
                  className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 outline-none transition-all bg-white dark:bg-gray-900 dark:border-pink-600 dark:focus:ring-pink-800 shadow-lg placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-pink-500 to-red-500 text-white font-bold py-3 px-6 rounded-2xl text-lg shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {language === "bn" ? "ভবিষ্যৎ দেখো" : "See Prediction"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Secondary action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <button
            onClick={() => {
              const newLang = language === "bn" ? "en" : "bn";
              router.push(`/${encodeURIComponent(rawName)}?lang=${newLang}`);
            }}
            className="px-5 py-3 bg-linear-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-sm"
          >
            {language === "bn" ? "English" : "বাংলা"}
          </button>

          <Link href="/">
            <div className="px-5 py-3 bg-linear-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-sm">
              {language === "bn" ? "হোমে যাও" : "Back to Home"}
            </div>
          </Link>
        </div>

        {/* Viral prompt — encourage sharing */}
        <div className="max-w-md mx-auto mt-10 text-center bg-linear-to-r from-yellow-50 to-pink-50 dark:from-yellow-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-pink-200 dark:border-pink-800">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            {language === "bn"
              ? "এই link বন্ধুদের পাঠাও — তাদের reaction দেখো!"
              : "Send this link to friends — watch their reaction!"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === "bn"
              ? "তাদের নাম দিয়ে নতুন prediction বানাও"
              : "Make predictions with their names above"}
          </p>
        </div>

        <Footer />
      </div>
    </main>
  );
}
