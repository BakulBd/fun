"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#fffbf5] px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl font-black block mb-4 text-red-400">!</span>
          <h1 className="text-3xl font-extrabold text-red-500 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            The prediction generator hit a bump. Let&apos;s try again!
          </p>
          <button
            onClick={() => reset()}
            className="inline-block bg-linear-to-r from-pink-500 to-red-500 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
