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
};

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
}: FloatingInputProps) {
  const isUnderline = variant === "underline";
  const isSelect = Boolean(options?.length);
  const hasError = Boolean(error) || invalid;

  const underlineFieldClasses = `w-full border-0 border-b bg-transparent px-0 pb-2.5 pt-6 text-sm text-slate-800 outline-none transition-colors ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-sky-600"
  }`;

  if (isSelect) {
    return (
      <div>
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
        />
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
              : `peer w-full rounded-xl border bg-white px-4 pb-2.5 pt-5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-transparent ${
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
              ? "pointer-events-none absolute left-0 top-5 origin-left text-sm text-slate-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:scale-[0.85] peer-focus:text-slate-500 peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.85] peer-not-placeholder-shown:text-slate-500"
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
