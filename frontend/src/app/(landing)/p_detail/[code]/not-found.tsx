import Link from "next/link";
import Header from "@/components/shared/layout/Header";

export default function ShortPropertyNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-800 sm:text-4xl">
          Property not available
        </h1>
        <p className="mt-3 text-slate-600">
          This property link is invalid, or the listing has been removed or is no longer published.
        </p>
        <Link
          href="/"
          className="mt-8 text-sm font-semibold text-navy-blue underline-offset-2 hover:text-sky-700 hover:underline"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
