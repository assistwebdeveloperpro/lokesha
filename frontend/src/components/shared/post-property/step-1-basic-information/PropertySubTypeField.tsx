import type { PropertySubTypeOption } from "../config/postPropertyForm.shared";
import { postPropertyTileClass } from "../config/postPropertyForm.styles";

export default function PropertySubTypeField({
  title,
  options,
  value,
  onChange,
  values,
  onChangeMany,
}: {
  title: string;
  options: PropertySubTypeOption[];
  value: string;
  onChange: (value: string) => void;
  values?: string[];
  onChangeMany?: (values: string[]) => void;
}) {
  const isMulti = Boolean(onChangeMany && values);

  // At least one sub type always stays selected
  const select = (id: string) => {
    if (!isMulti || !values || !onChangeMany) {
      onChange(id);
      return;
    }

    if (!values.includes(id)) {
      onChangeMany([...values, id]);
    } else if (values.length > 1) {
      onChangeMany(values.filter((item) => item !== id));
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/30 px-1.5 py-4 sm:p-5">
      <h3
        className={`text-base font-bold text-slate-800 sm:text-lg ${isMulti ? "" : "mb-4"}`}
      >
        {title} - Sub Type
      </h3>
      {isMulti ? (
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Select one or more sub types in this project
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {options.map((option) => {
          const isSelected = isMulti
            ? Boolean(values?.includes(option.id))
            : value === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => select(option.id)}
              aria-pressed={isSelected}
              className={`group flex min-h-24 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center sm:min-h-26 md:min-h-18 md:flex-row md:items-center md:justify-start md:gap-2.5 md:px-4 md:py-4 md:text-left ${postPropertyTileClass(isSelected)}`}
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
                className={`w-full min-w-0 wrap-break-word px-0.5 text-sm font-semibold leading-snug md:flex-1 md:px-0 ${
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
