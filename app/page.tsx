import { cookies } from "next/headers";
import { detectHomepageLanguage } from "@/lib/language-detect";
import Hero from "@/components/Hero";
import NameInput from "@/components/NameInput";
import TrendingNames from "@/components/TrendingNames";
import Footer from "@/components/Footer";

export default async function Home() {
  const cookieStore = await cookies();
  const geoLang = cookieStore.get("geo-lang")?.value;
  const lang = detectHomepageLanguage(geoLang);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <Hero lang={lang} />
        <NameInput lang={lang} />
        <TrendingNames lang={lang} />
        <Footer lang={lang} />
      </div>
    </main>
  );
}
