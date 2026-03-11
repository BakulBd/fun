"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface TrendingNamesProps {
  lang: "en" | "bn";
}

const trendingNames = [
  { name: "Rahim", emoji: "🔥" },
  { name: "Sumon", emoji: "⚡" },
  { name: "Rakib", emoji: "💥" },
  { name: "Arif", emoji: "🌟" },
  { name: "Karim", emoji: "✨" },
  { name: "Fahim", emoji: "🎯" },
  { name: "Sakib", emoji: "🏏" },
  { name: "Naim", emoji: "🎭" },
  { name: "Tanvir", emoji: "🚀" },
  { name: "Mehedi", emoji: "🎪" },
  { name: "Sohel", emoji: "💀" },
  { name: "Rony", emoji: "🩴" },
  { name: "Masud", emoji: "😱" },
  { name: "Bakul", emoji: "🏏" },
  { name: "Rubel", emoji: "😂" },
  { name: "Nusrat", emoji: "👑" },
  { name: "Tasnim", emoji: "💃" },
  { name: "Sadia", emoji: "🌸" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TrendingNames({ lang }: TrendingNamesProps) {
  const bn = lang === "bn";

  return (
    <motion.section
      className="max-w-3xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">
        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          {bn ? "🔥 এই নামগুলো চেষ্টা করো" : "🔥 Try These Names"}
        </span>
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        {bn
          ? "যেকোনো নামে ক্লিক করো — মজার prediction দেখো!"
          : "Click any name to see their hilarious married life prediction!"}
      </p>

      <motion.div
        className="flex flex-wrap justify-center gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {trendingNames.map(({ name, emoji }) => (
          <motion.div key={name} variants={item}>
            <Link href={`/${name.toLowerCase()}`}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: [-1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border-2 border-pink-300 dark:border-pink-700 rounded-full font-bold text-gray-800 dark:text-gray-100 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{emoji}</span>
                <span>{name}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
