import PostPropertyFieldSection from "./PostPropertyFieldSection";
import {
  LISTING_TYPES,
  type ListingTypeId,
} from "./postPropertyForm.shared";
import { postPropertyTileClass } from "./postPropertyForm.styles";

export default function ListingTypeField({
  value,
  onChange,
}: {
  value: ListingTypeId;
  onChange: (value: ListingTypeId) => void;
}) {
  return (
    <PostPropertyFieldSection
      title="Listing Type"
      description="Choose whether you want to sell or rent your property"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {LISTING_TYPES.map((type) => {
          const isSelected = value === type.id;
          const subtitle =
            type.id === "sale"
              ? "List for buyers"
              : type.id === "rent-lease"
                ? "List for tenants"
                : "List for guests";

          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(type.id)}
              className={`flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-4 py-4 text-center transition-all lg:min-h-[5rem] ${postPropertyTileClass(isSelected)}`}
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
