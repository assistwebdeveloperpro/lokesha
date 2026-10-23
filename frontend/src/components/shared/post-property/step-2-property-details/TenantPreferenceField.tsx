import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import {
  TENANT_PREFERENCE_OPTIONS,
  type ImageTileOption,
} from "../config/postPropertyForm.shared";
import { postPropertyTileClass } from "../config/postPropertyForm.styles";

export default function TenantPreferenceField({
  value,
  onChange,
  error,
  imageOptions,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  imageOptions?: ImageTileOption[];
}) {
  const options = imageOptions ?? TENANT_PREFERENCE_OPTIONS;
  const toggleOption = (optionId: string) => {
    onChange(
      value.includes(optionId)
        ? value.filter((id) => id !== optionId)
        : [...value, optionId],
    );
  };

  return (
    <PostPropertyFieldSection
      title="Tenant Preference"
      required
      description="Select the tenants you prefer for this property"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {options.map((option) => {
          const isSelected = value.includes(option.id);
          const Icon = "icon" in option ? option.icon : null;
          const imageSrc =
            "image" in option
              ? typeof option.image === "string"
                ? option.image
                : option.image.src
              : "";

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleOption(option.id)}
              aria-pressed={isSelected}
              className={`flex min-h-[8rem] w-full flex-col items-center justify-center gap-2.5 rounded-xl border px-3 py-5 text-center sm:min-h-[8.5rem] sm:gap-3 sm:px-4 sm:py-6 ${postPropertyTileClass(isSelected)}`}
            >
              <span className="flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
                {Icon ? (
                  <Icon
                    className={`h-10 w-10 transition-transform duration-300 ease-out ${
                      isSelected
                        ? "scale-125 text-sky-700"
                        : "text-slate-500 group-hover:scale-110"
                    }`}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt=""
                    className={`h-10 w-10 object-contain transition-transform duration-300 ease-out ${
                      isSelected ? "scale-125" : "group-hover:scale-110"
                    }`}
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={`text-center text-sm font-bold leading-tight sm:text-base ${
                  isSelected ? "text-sky-800" : "text-slate-700"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </PostPropertyFieldSection>
  );
}
