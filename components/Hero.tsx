interface HeroProps {
  lang: "en" | "bn";
}

export default function Hero({ lang }: HeroProps) {
  const bn = lang === "bn";

  return (
    <section className="relative overflow-hidden py-14 md:py-20 text-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
        <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
      </div>

      <div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
          {bn ? (
            <>
              বিয়ের পরের
              <br />
              ভবিষ্যদ্বাণী জেনারেটর
            </>
          ) : (
            <>
              After Marriage
              <br />
              Prediction Generator
            </>
          )}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
          {bn
            ? "যেকোনো নাম লিখো — বিয়ের পরের ভবিষ্যৎ জেনে নাও!"
            : "Type any name & see their after-marriage future!"}
          <br />
          <span className="text-pink-500 font-semibold mt-1 inline-block">
            {bn
              ? "বন্ধুদের Tag করো — তাদের reaction দেখো!"
              : "Tag your friends — watch their reaction!"}
          </span>
        </p>

        <div className="mt-4 inline-block bg-linear-to-r from-pink-500/10 to-yellow-500/10 rounded-full px-6 py-2 border border-pink-200 dark:border-pink-800">
          <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
            {bn
              ? "ইতিমধ্যে ১০,০০০+ শেয়ার হয়েছে"
              : "Already viral with 10,000+ shares"}
          </span>
        </div>
      </div>
    </section>
  );
}
