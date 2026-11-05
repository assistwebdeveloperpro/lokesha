import { Home } from "lucide-react";
import type { PropertyDetailsNearbyPlace } from "./propertyDetails.types";

type PropertyDetailsNearbyPlacesProps = {
  items: PropertyDetailsNearbyPlace[];
};

export function PropertyDetailsNearbyPlaces({ items }: PropertyDetailsNearbyPlacesProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-800 sm:text-base">Nearby Places</h3>
      <ul className="space-y-4">
        {items.map(({ place, distance }, index) => (
          <li key={`${index}-${place}`} className="flex items-center gap-2.5">
            <Home className="h-5 w-5 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
            <span className="text-sm leading-snug text-slate-700 sm:text-sm">
              {place}
              {distance ? ` - ${distance}` : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
