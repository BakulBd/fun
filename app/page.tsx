import Hero from "@/components/Hero";
import NameInput from "@/components/NameInput";
import TrendingNames from "@/components/TrendingNames";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <Hero />
        <NameInput />
        <TrendingNames />
        <Footer />
      </div>
    </main>
  );
}
