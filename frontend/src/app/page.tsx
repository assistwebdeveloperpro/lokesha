import Header from "@/components/shared/layout/Header";
import HeroBanner from "@/components/landing/home/hero-banner/HeroBanner";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header />
      <main className="flex flex-1 flex-col">
        <HeroBanner />
      </main>
    </div>
  );
}
