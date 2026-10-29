import { X } from "lucide-react";
import { FOCUS_RING } from "../home/hero-banner/heroBanner.shared";
import type { FilterChip } from "./searchFilterChips";

type ActiveFilterChipsProps = {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
};

export function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li
          key={chip.id}
          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-navy-blue"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove ${chip.label}`}
            onClick={() => onRemove(chip)}
            className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full hover:bg-sky-100 ${FOCUS_RING}`}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={onClearAll}
          className={`cursor-pointer text-xs font-semibold text-slate-600 underline-offset-2 hover:text-navy-blue hover:underline ${FOCUS_RING}`}
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
