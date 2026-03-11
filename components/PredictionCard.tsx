"use client";

import { motion } from "framer-motion";

interface PredictionCardProps {
  name: string;
  prediction: string;
  language: "en" | "bn";
}

export default function PredictionCard({
  name,
  prediction,
  language,
}: PredictionCardProps) {
  const title =
    language === "bn"
      ? `${name} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী 😂`
      : `${name}'s Married Life Prediction 😂`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="relative bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 dark:from-yellow-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-pink-300 dark:border-pink-700">
        {/* Decorative corner emojis */}
        <span className="absolute top-3 left-4 text-3xl">💍</span>
        <span className="absolute top-3 right-4 text-3xl">💒</span>
        <span className="absolute bottom-3 left-4 text-3xl">💑</span>
        <span className="absolute bottom-3 right-4 text-3xl">😂</span>

        <motion.h2
          className="text-2xl md:text-3xl font-extrabold text-center bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h2>

        <motion.div
          className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 md:p-8 shadow-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl md:text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 leading-relaxed">
            &ldquo;{prediction}&rdquo;
          </p>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "bn"
              ? "⚠️ এটি শুধুমাত্র মজার জন্য! বাস্তবতার সাথে কোনো সম্পর্ক নেই 😜"
              : "⚠️ This is just for fun! No relation to reality 😜"}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
