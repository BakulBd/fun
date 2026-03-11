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
      ? `${name} এর বিবাহিত জীবনের ভবিষ্যদ্বাণী`
      : `${name}'s Married Life Prediction`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-linear-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-yellow-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-3xl p-8 md:p-12 shadow-xl border border-pink-200 dark:border-pink-800">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center bg-linear-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-6">
          {title}
        </h2>

        <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 md:p-8 shadow-inner">
          <p className="text-xl md:text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 leading-relaxed">
            &ldquo;{prediction}&rdquo;
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "bn"
              ? "এটি শুধুমাত্র মজার জন্য! বাস্তবতার সাথে কোনো সম্পর্ক নেই।"
              : "This is just for fun! No relation to reality."}
          </p>
        </div>
      </div>
    </div>
  );
}
