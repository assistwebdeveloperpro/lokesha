import {
  PROPERTY_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "./postPropertyForm.shared";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import { postPropertyTileClass } from "./postPropertyForm.styles";
import PropertySubTypeField from "./PropertySubTypeField";

export default function PropertyTypeField({
  value,
  onChange,
  subType,
  onSubTypeChange,
}: {
  value: PropertyTypeId;
  onChange: (value: PropertyTypeId) => void;
  subType: string;
  onSubTypeChange: (value: string) => void;
}) {
  const subTypeOptions = SUB_TYPES_BY_PROPERTY_TYPE[value];
  const selectedPropertyType = PROPERTY_TYPES.find((type) => type.id === value);

  return (
    <PostPropertyFieldSection
      title="Property Type"
      description="Select the category that best describes your property"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PROPERTY_TYPES.map((type) => {
          const isSelected = value === type.id;
          const imageSrc =
            typeof type.image === "string" ? type.image : type.image.src;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              aria-pressed={isSelected}
              className={`flex min-h-[8rem] w-full flex-col items-center justify-center gap-2.5 rounded-xl border px-3 py-5 text-center sm:min-h-[8.5rem] sm:gap-3 sm:px-4 sm:py-6 ${postPropertyTileClass(isSelected)}`}
            >
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden sm:h-16 sm:w-16">
                <img
                  src={imageSrc}
                  alt=""
                  className={`h-10 w-10 object-contain transition-transform duration-300 ease-out ${
                    isSelected ? "scale-125" : "group-hover:scale-110"
                  }`}
                  aria-hidden
                />
              </span>
              <span
                className={`text-center text-sm font-bold leading-tight sm:text-base ${
                  isSelected ? "text-sky-800" : "text-slate-700"
                }`}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      {subTypeOptions && selectedPropertyType ? (
        <PropertySubTypeField
          title={selectedPropertyType.label}
          options={subTypeOptions}
          value={subType}
          onChange={onSubTypeChange}
        />
      ) : null}
    </PostPropertyFieldSection>
  );
}
