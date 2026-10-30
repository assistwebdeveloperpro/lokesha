import { Building2, MapPin, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SearchTag } from "./heroBanner.shared";
import {
  isSuggestionQuery,
  type SearchSuggestionGroups,
} from "./heroSearchSuggestions";

const SEARCH_HINTS: { icon: LucideIcon; label: string }[] = [
  { icon: MapPin, label: "City, Locality" },
  { icon: MapPinned, label: "Area (like South Delhi)" },
  { icon: Building2, label: "Project Name" },
];

const DROPDOWN_CLASS =
  "absolute left-0 top-full z-50 mt-1 w-full min-w-62 rounded-lg border border-slate-200 bg-white py-3 shadow-lg sm:min-w-[20rem]";

type HeroSearchHintsDropdownProps = {
  searchText: string;
  suggestions: SearchSuggestionGroups;
  onSelect: (tag: SearchTag) => void;
};

function SuggestionGroup({
  heading,
  icon: Icon,
  tags,
  onSelect,
}: {
  heading: string;
  icon: LucideIcon;
  tags: SearchTag[];
  onSelect: (tag: SearchTag) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div role="group" aria-label={heading}>
      <p className="px-4 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {heading}
      </p>
      <ul>
        {tags.map((tag) => (
          <li key={tag.label}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(tag)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-1.5 text-left text-slate-700 hover:bg-sky-50 focus-visible:outline-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50">
                <Icon className="h-4 w-4 text-sky-600" aria-hidden />
              </span>
              <span className="text-sm font-medium">{tag.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroSearchHintsDropdown({
  searchText,
  suggestions,
  onSelect,
}: HeroSearchHintsDropdownProps) {
  if (!isSuggestionQuery(searchText)) {
    return (
      <div role="region" aria-label="Search suggestions" className={DROPDOWN_CLASS}>
        <p className="px-4 pb-1 text-sm font-bold text-slate-800">You can enter</p>
        <ul className="py-1">
          {SEARCH_HINTS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 px-4 py-1 text-slate-600"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                <Icon className="h-4 w-4 text-sky-600" aria-hidden />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const hasResults =
    suggestions.cities.length > 0 || suggestions.localities.length > 0;

  if (!hasResults) return null;

  return (
    <div
      role="region"
      aria-label="Search suggestions"
      className={`${DROPDOWN_CLASS} max-h-60 overflow-y-auto`}
    >
      <SuggestionGroup
        heading="City"
        icon={MapPin}
        tags={suggestions.cities}
        onSelect={onSelect}
      />
      <SuggestionGroup
        heading="Locality"
        icon={MapPinned}
        tags={suggestions.localities}
        onSelect={onSelect}
      />
    </div>
  );
}
