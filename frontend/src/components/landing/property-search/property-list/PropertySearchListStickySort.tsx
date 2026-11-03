import type { SearchSort } from "@/lib/property-search-url/toSearchApiQuery";
import { PropertySearchSortDropdown } from "./PropertySearchSortDropdown";

type PropertySearchListStickySortProps = {
  value: SearchSort;
  onChange: (value: SearchSort) => void;
};

export function PropertySearchListStickySort({
  value,
  onChange,
}: PropertySearchListStickySortProps) {
  return (
    <div className="hidden pb-2 pt-1 lg:block">
      <PropertySearchSortDropdown value={value} onChange={onChange} />
    </div>
  );
}
