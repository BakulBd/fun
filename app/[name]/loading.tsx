export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🔮</div>
        <p className="text-xl font-bold text-pink-500 animate-pulse">
          Generating prediction...
        </p>
      </div>
    </main>
  );
}
