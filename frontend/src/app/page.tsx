import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <h1 className="font-display text-3xl font-bold text-slate-800 sm:text-4xl">
          Welcome to Lokesha
        </h1>
        <p className="mt-2 text-center text-slate-600">
          Find your dream property — buy, rent, or sell with ease.
        </p>
      </main>
    </div>
  );
}
