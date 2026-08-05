import type { PropertySubTypeOption } from "./postPropertyForm.shared";
import { postPropertyTileClass } from "./postPropertyForm.styles";

export default function PropertySubTypeField({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: PropertySubTypeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/30 p-4 sm:p-5">
      <h3 className="mb-4 text-base font-bold text-slate-800 sm:text-lg">
        {title} — Sub Type
      </h3>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {options.map((option) => {
          const isSelected = value === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={isSelected}
              className={`group flex min-h-[6rem] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center sm:min-h-[6.5rem] md:min-h-[4.5rem] md:flex-row md:items-center md:justify-start md:gap-2.5 md:px-4 md:py-4 md:text-left ${postPropertyTileClass(isSelected)}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center md:h-10 md:w-10">
                <Icon
                  className={`h-5 w-5 ${
                    isSelected ? "text-sky-800" : "text-slate-600"
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
              <span
                className={`w-full min-w-0 break-words px-0.5 text-sm font-semibold leading-snug md:flex-1 md:px-0 ${
                  isSelected ? "text-sky-800" : "text-slate-700"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
