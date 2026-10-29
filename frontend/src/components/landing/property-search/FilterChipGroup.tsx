import {
  CHIP_DEFAULT,
  CHIP_SELECTED,
  FOCUS_RING,
} from "../home/hero-banner/heroBanner.shared";
import type { FilterOption } from "./searchFilterOptions";

type FilterChipGroupProps<T extends string | number> = {
  title: string;
  options: FilterOption<T>[];
  isSelected: (value: T) => boolean;
  onToggle: (value: T) => void;
};

export function FilterChipGroup<T extends string | number>({
  title,
  options,
  isSelected,
  onToggle,
}: FilterChipGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-800">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option.value)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selected ? CHIP_SELECTED : CHIP_DEFAULT
              } ${FOCUS_RING}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
