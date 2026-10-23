import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import {
  LISTING_TYPES,
  type ListingTypeId,
} from "../config/postPropertyForm.shared";
import { postPropertyTileClass } from "../config/postPropertyForm.styles";

export default function ListingTypeField({
  value,
  onChange,
  allowedIds,
}: {
  value: ListingTypeId;
  onChange: (value: ListingTypeId) => void;
  allowedIds?: ListingTypeId[];
}) {
  const visibleTypes = LISTING_TYPES.filter(
    (type) => !allowedIds || allowedIds.includes(type.id),
  );

  return (
    <PostPropertyFieldSection
      title="Listing Type"
      description="Choose whether you want to sell or rent your property"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleTypes.map((type) => {
          const isSelected = value === type.id;
          const subtitle =
            type.id === "sale" ? "List for buyers" : "List for tenants";

          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(type.id)}
              className={`flex min-h-18 w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-4 py-4 text-center transition-all lg:min-h-20 ${postPropertyTileClass(isSelected)}`}
            >
              <span
                className={`text-sm font-bold sm:text-base ${
                  isSelected ? "text-sky-800" : "text-slate-700"
                }`}
              >
                {type.label}
              </span>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-sky-700" : "text-slate-500"
                }`}
              >
                {subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </PostPropertyFieldSection>
  );
}
