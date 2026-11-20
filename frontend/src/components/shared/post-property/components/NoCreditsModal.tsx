"use client";

import { Crown, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const BUY_PATH = "/user/subscription/subscribed-services#buy-standard";

export default function NoCreditsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-credits-heading"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="bg-linear-to-r-navy-blue relative px-6 py-6 text-white">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Crown className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 id="no-credits-heading" className="font-display mt-4 text-xl font-bold">
            You are out of listing credits
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-300">Get more with the Standard package and keep publishing.</p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">
            Your property details are still on this page, nothing was lost. Buy the Standard package, then come back here and submit your property.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Keep editing
            </button>
            <Link
              href={BUY_PATH}
              target="_blank"
              rel="noopener"
              className="bg-linear-to-r-navy-blue inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Buy Standard Package
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
