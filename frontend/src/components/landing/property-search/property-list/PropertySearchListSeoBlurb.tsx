"use client";

import { useState } from "react";

type PropertySearchListSeoBlurbProps = {
  text: string;
};

export function PropertySearchListSeoBlurb({ text }: PropertySearchListSeoBlurbProps) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <p className="text-sm leading-relaxed text-slate-500">
        {text}{" "}
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="font-semibold text-sky-700 hover:text-navy-blue hover:underline"
        >
          Less
        </button>
      </p>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1 text-sm text-slate-500">
      <p className="min-w-0 truncate pt-1">{text}</p>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="shrink-0 font-semibold text-sky-700 hover:text-navy-blue hover:underline"
      >
        More
      </button>
    </div>
  );
}
