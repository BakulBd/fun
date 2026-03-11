import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl font-black block mb-4 text-gray-300">404</span>
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          Page Not Found!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          This prediction doesn&apos;t exist yet. Try entering a name to see their married life future!
        </p>
        <Link
          href="/"
          className="inline-block bg-linear-to-r from-pink-500 to-red-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Go to Prediction Generator
        </Link>
      </div>
    </main>
  );
}
