"use client";

import { Check } from "lucide-react";
import { TRUST_ITEMS } from "./heroBanner.shared";

export function HeroTrustList() {
  return (
    <ul className="mt-4 flex flex-col items-start gap-2.5 sm:mt-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2">
      {TRUST_ITEMS.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:text-sm"
        >
          <span className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Check
              className="h-2.5 w-2.5 text-white"
              strokeWidth={3}
              aria-hidden
            />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
