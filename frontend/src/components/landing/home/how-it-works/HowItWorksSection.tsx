import { Handshake, Search, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: "Search",
    description: "Pick a city, locality or project and narrow down with filters.",
  },
  {
    icon: ShieldCheck,
    title: "Shortlist",
    description: "Compare verified listings with clear pricing and details.",
  },
  {
    icon: Handshake,
    title: "Connect",
    description: "Reach owners, agents and builders directly and close the deal.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-slate-800">
          How it works
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
                <Icon className="h-5 w-5 text-sky-600" aria-hidden />
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-800">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
