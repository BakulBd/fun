"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NameInputProps {
  lang: "en" | "bn";
}

export default function NameInput({ lang }: NameInputProps) {
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const bn = lang === "bn";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    router.push(`/${encodeURIComponent(trimmed.toLowerCase())}`);
  };

  return (
    <section className="max-w-xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`relative ${shake ? "animate-shake" : ""}`}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              bn
                ? "তোমার / বন্ধুর নাম লিখো... (যেমন: রাকিব, Rahim)"
                : "Enter your / friend's name... (e.g., Rahim)"
            }
            maxLength={50}
            className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 outline-none transition-all bg-white dark:bg-gray-900 dark:border-pink-600 dark:focus:ring-pink-800 shadow-lg placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-linear-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
        >
          {bn
            ? "বিয়ের পরের ভবিষ্যৎ দেখো"
            : "See After-Marriage Prediction"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-3">
        {bn
          ? "অথবা নিচের নাম ক্লিক করো"
          : "Or click a name below"}
      </p>
    </section>
  );
}
