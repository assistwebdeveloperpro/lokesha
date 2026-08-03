import CustomDropdown, { type DropdownOption } from "./CustomDropdown";

type FloatingInputProps = {
  id: string;
  label?: string;
  ariaLabel?: string;
  type?: string;
  variant?: "boxed" | "underline";
  rightSlot?: React.ReactNode;
  options?: DropdownOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  invalid?: boolean;
  prominentLabel?: boolean;
  staticLabel?: boolean;
  blackText?: boolean;
  dropdownMenuClassName?: string;
};

const staticLabelClasses = "mb-2.5 block text-sm font-semibold text-slate-700";

export default function FloatingInput({
  id,
  label,
  ariaLabel,
  type = "text",
  variant = "boxed",
  rightSlot,
  options,
  defaultValue,
  value,
  onChange,
  error,
  invalid = false,
  prominentLabel = false,
  staticLabel = false,
  blackText = false,
  dropdownMenuClassName,
}: FloatingInputProps) {
  const isUnderline = variant === "underline";
  const isSelect = Boolean(options?.length);
  const hasError = Boolean(error) || invalid;
  const fieldTextColor = blackText ? "text-black font-medium" : "text-slate-900 font-medium";

  const underlineFieldClasses = `w-full border-0 border-b bg-transparent px-0 pb-2.5 text-sm ${fieldTextColor} outline-none transition-colors ${
    staticLabel ? "pt-2" : prominentLabel ? "pt-7" : "pt-6"
  } ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-sky-600"
  }`;

  if (isSelect) {
    return (
      <div className="w-full min-w-0">
        <CustomDropdown
          id={id}
          label={label}
          ariaLabel={ariaLabel}
          options={options!}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          hasError={hasError}
          variant={variant}
          prominentLabel={prominentLabel}
          staticLabel={staticLabel}
          blackText={blackText}
          menuClassName={dropdownMenuClassName}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (staticLabel && isUnderline) {
    return (
      <div>
        {label && (
          <label htmlFor={id} className={staticLabelClasses}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            type={type}
            value={value}
            aria-invalid={hasError}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            className={underlineFieldClasses}
          />
          {rightSlot && (
            <div className="absolute right-0 bottom-2.5">{rightSlot}</div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder=" "
          value={value}
          aria-invalid={hasError}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={
            isUnderline
              ? `peer ${underlineFieldClasses} placeholder:text-transparent`
              : `peer w-full rounded-xl border bg-white px-4 pb-2.5 pt-5 text-sm ${fieldTextColor} shadow-sm outline-none transition-all placeholder:text-transparent ${
                  hasError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                }`
          }
        />
        <label
          htmlFor={id}
          className={
            isUnderline
              ? prominentLabel
                ? blackText
                  ? "pointer-events-none absolute left-0 top-5 origin-left text-base font-medium text-black transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0.5 peer-focus:text-black peer-not-placeholder-shown:top-0.5 peer-not-placeholder-shown:text-base peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-black"
                  : "pointer-events-none absolute left-0 top-5 origin-left text-base font-medium text-slate-600 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0.5 peer-focus:text-slate-800 peer-not-placeholder-shown:top-0.5 peer-not-placeholder-shown:text-base peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-800"
                : "pointer-events-none absolute left-0 top-5 origin-left text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:scale-[0.85] peer-focus:text-slate-500 peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.85] peer-not-placeholder-shown:text-slate-500"
              : "pointer-events-none absolute left-4 top-3.5 origin-left text-sm text-slate-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:scale-[0.85] peer-focus:text-sky-700 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:scale-[0.85] peer-not-placeholder-shown:text-sky-700"
          }
        >
          {label}
        </label>
        {rightSlot && (
          <div
            className={`absolute right-0 ${isUnderline ? "bottom-2.5" : "top-1/2 -translate-y-1/2"}`}
          >
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
