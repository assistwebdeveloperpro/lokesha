"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

type PropertyDetailsAboutTabsProps = {
  title: string;
  address: string;
  description: string;
};

export function PropertyDetailsAboutTabs({
  title,
  address,
  description,
}: PropertyDetailsAboutTabsProps) {
  const [tab, setTab] = useState<"description" | "address">("description");

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab("description")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
            tab === "description"
              ? "bg-white text-navy-blue shadow-sm"
              : "text-slate-600 hover:text-navy-blue"
          }`}
        >
          Description
        </button>
        <button
          type="button"
          onClick={() => setTab("address")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
            tab === "address"
              ? "bg-white text-navy-blue shadow-sm"
              : "text-slate-600 hover:text-navy-blue"
          }`}
        >
          Address
        </button>
      </div>

      {tab === "description" ? (
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-600">{address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
