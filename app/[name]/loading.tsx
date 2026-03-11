export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold text-pink-500 animate-pulse">
          Generating prediction...
        </p>
      </div>
    </main>
  );
}
