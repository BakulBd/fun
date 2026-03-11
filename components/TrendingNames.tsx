import Link from "next/link";

interface TrendingNamesProps {
  lang: "en" | "bn";
}

const trendingNames = [
  // Male names - mix of popular BD names
  "Rahim", "Sumon", "Rakib", "Arif", "Fahim", "Sakib",
  "Tanvir", "Bakul", "Rubel", "Tipu", "Rasel", "Sabbir",
  // Female names - mix of popular BD names
  "Nusrat", "Tasnim", "Sadia", "Farzana", "Lamia", "Anika",
  "Riya", "Mitu", "Sharmin", "Jannatul", "Bristy", "Tania",
];

export default function TrendingNames({ lang }: TrendingNamesProps) {
  const bn = lang === "bn";

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">
        <span className="bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          {bn ? "এই নামগুলো চেষ্টা করো" : "Try These Names"}
        </span>
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        {bn
          ? "যেকোনো নামে ক্লিক করো — মজার prediction দেখো!"
          : "Click any name to see their hilarious married life prediction!"}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {trendingNames.map((name) => (
          <Link key={name} href={`/${name.toLowerCase()}`}>
            <div className="inline-flex items-center px-5 py-3 bg-linear-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-200 dark:border-pink-800 rounded-full font-bold text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
              {name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
