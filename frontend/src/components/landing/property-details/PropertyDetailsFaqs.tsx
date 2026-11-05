"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";
import type { PropertyDetailsFaq } from "./propertyDetails.types";

type PropertyDetailsFaqsProps = {
  items: PropertyDetailsFaq[];
};

export function PropertyDetailsFaqs({ items }: PropertyDetailsFaqsProps) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => new Set());

  const toggle = (index: number) => {
    setOpenIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <ul className="divide-y divide-slate-200">
      {items.map(({ question, answer }, index) => {
        const isOpen = openIndexes.has(index);
        const panelId = `${baseId}-faq-${index}`;

        return (
          <li key={`${index}-${question}`}>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 py-3.5 text-left sm:py-4"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span className="text-sm font-semibold text-navy-deep sm:text-base">{question}</span>
              {isOpen ? (
                <ChevronUp className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
              ) : (
                <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" aria-hidden />
              )}
            </button>
            {isOpen ? (
              <p id={panelId} className="pb-3.5 text-sm leading-relaxed text-slate-500 sm:pb-4">
                {answer}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
