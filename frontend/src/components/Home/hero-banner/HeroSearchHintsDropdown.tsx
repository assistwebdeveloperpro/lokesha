import { Building2, MapPin, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SEARCH_HINTS: { icon: LucideIcon; label: string }[] = [
  { icon: MapPin, label: "City, Locality" },
  { icon: MapPinned, label: "Area (like South Delhi)" },
  { icon: Building2, label: "Project or Builder name" },
];

export function HeroSearchHintsDropdown() {
  return (
    <div
      role="region"
      aria-label="Search suggestions"
      className="absolute left-0 top-full z-50 mt-1 w-full min-w-[15.5rem] rounded-lg border border-slate-200 bg-white py-3 shadow-lg sm:min-w-[20rem]"
    >
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
