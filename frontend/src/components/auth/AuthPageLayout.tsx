"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const benefits = [
  "Post one Single Property for FREE",
  "Set property alerts for your requirement",
  "Get accessed by over 1 Lakh buyers",
  "Showcase your property as Rental, PG or for Sale",
  "Get instant queries over Phone, Email and SMS",
  "Performance in search & Track responses & views online",
  "Add detailed property information & multiple photos per listing",
];

function CheckIcon() {
  return (
    <CheckCircle2
      className="mt-1 h-4.5 w-4.5 shrink-0 text-sky-300"
      aria-hidden
    />
  );
}

function PanelToggleButton({
  direction,
  onClick,
  label,
  className = "",
}: {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  className?: string;
}) {
  const isCollapse = direction === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={!isCollapse}
      className={`group z-30 flex h-10 w-7 cursor-pointer items-center justify-center transition-all duration-300 hover:scale-105 sm:h-11 sm:w-8 ${
        isCollapse
          ? "rounded-l-xl bg-linear-to-b from-white via-slate-50 to-sky-100 text-sky-800 shadow-[0_4px_20px_rgba(15,23,42,0.25)] ring-1 ring-white/90 hover:text-sky-900"
          : "rounded-r-xl bg-navy-blue text-white ring-1 ring-sky-300/60 hover:shadow-[0_4px_20px_rgba(2,132,199,0.4)]"
      } ${className}`}
    >
      {isCollapse ? (
        <ChevronLeft className="h-4 w-4" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

function subscribeToMediaQuery(query: string, callback: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMediaQuerySnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function getMediaQueryServerSnapshot() {
  return false;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(query, callback),
    () => getMediaQuerySnapshot(query),
    getMediaQueryServerSnapshot,
  );
}

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [userPanelOpen, setUserPanelOpen] = useState<boolean | null>(null);

  const panelOpen = userPanelOpen ?? isDesktop;

  const closePanel = () => setUserPanelOpen(false);
  const openPanel = () => setUserPanelOpen(true);

  return (
    <div className="relative flex min-h-full w-full flex-col lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
      {/* Benefits panel — large screens only */}
      <aside
        className={`relative hidden h-full shrink-0 flex-col overflow-hidden bg-cover bg-center transition-[width] duration-300 ease-out lg:flex ${
          panelOpen ? "lg:w-[36%] xl:w-[36%]" : "lg:w-0"
        }`}
        aria-hidden={!panelOpen}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r-navy-blue" />

        <div
          className={`auth-panel-body relative flex h-full min-h-0 flex-col justify-center overflow-hidden px-10 py-10 xl:px-14 xl:py-12 ${
            panelOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="max-w-md">
            <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-sky-100 ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Why join Lokesha
            </div>

            <h2 className="font-display text-[1.75rem] font-bold leading-[1.2] tracking-tight text-white xl:text-[2rem]">
              Things you Can Do with
              <span className="mt-2 block bg-linear-to-r from-sky-200 via-sky-300 to-cyan-200 bg-clip-text text-[1.85rem] font-bold tracking-tight text-transparent xl:text-[2.125rem]">
                Lokesha Account
              </span>
            </h2>

            <ul className="mt-8 space-y-4 xl:mt-10 xl:space-y-4.5">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3.5 text-[0.9375rem] font-normal leading-relaxed tracking-wide text-slate-100/90 xl:text-base"
                >
                  <CheckIcon />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {panelOpen && (
          <PanelToggleButton
            direction="left"
            label="Hide information panel"
            onClick={closePanel}
            className="absolute top-1/2 right-0 -translate-y-1/2"
          />
        )}
      </aside>

      {/* Form section — full width on small/medium screens */}
      <section className="relative flex min-w-0 flex-1 flex-col bg-[#f1f5f9] lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230F172A' stroke-width='0.5' opacity='0.08'%3E%3Cpath d='M20 50l10-8 10 8v12H20z'/%3E%3Ccircle cx='55' cy='25' r='4'/%3E%3Cpath d='M10 20h8M14 16v8'/%3E%3Cpath d='M65 55h10M70 50v10'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-50/60 via-transparent to-sky-50/40" />

        {!panelOpen && isDesktop && (
          <PanelToggleButton
            direction="right"
            label="Show information panel"
            onClick={openPanel}
            className="absolute top-1/2 left-0 z-30 -translate-y-1/2"
          />
        )}

        <div className="relative flex flex-1 flex-col justify-start py-8 sm:py-10 lg:min-h-0 lg:justify-center lg:overflow-hidden lg:py-3 xl:py-4">
          {children}
        </div>
      </section>
    </div>
  );
}
