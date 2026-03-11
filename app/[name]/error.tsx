"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-8xl block mb-4">😵</span>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          Prediction Failed!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Something went wrong generating this prediction. Try again or go back home!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            🔄 Try Again
          </button>
          <Link
            href="/"
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            🏠 Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
