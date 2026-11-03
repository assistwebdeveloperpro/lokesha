import type { PublicAmenityItem } from "@/services/propertySearch.service";

type PropertyDetailsAmenityGridProps = {
  items: PublicAmenityItem[];
};

export function PropertyDetailsAmenityGrid({ items }: PropertyDetailsAmenityGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ name, imagePath }) => (
        <li
          key={name}
          className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePath} alt="" className="h-9 w-9 object-contain" aria-hidden />
          </span>
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">{name}</span>
        </li>
      ))}
    </ul>
  );
}
