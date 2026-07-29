import { Home } from "lucide-react";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="relative z-20 shrink-0 bg-navy-blue shadow-lg shadow-slate-950/20">
      <div className="mx-auto flex h-14 items-center justify-center px-4 sm:h-16">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Home className="h-4.5 w-4.5 text-sky-300" aria-hidden />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
            Lokesha
          </span>
        </Link>
      </div>
    </header>
  );
}
