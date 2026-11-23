import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const stepButtonClassName =
  "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700";

export default function QuantityStepper({ id, label, unit, value, min, max, disabled = false, onChange }: QuantityStepperProps) {
  const isFixed = min === max;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-400">{isFixed ? "Fixed for this package" : `${min} – ${max}`}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={disabled || isFixed || value <= min}
          onClick={() => onChange(value - 1)}
          className={stepButtonClassName}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            disabled={disabled || isFixed}
            onChange={(event) => onChange(Number(event.target.value))}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-16 text-center text-base font-bold text-slate-900 shadow-sm outline-none transition [appearance:textfield] focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            {value === 1 ? unit : `${unit}s`}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={disabled || isFixed || value >= max}
          onClick={() => onChange(value + 1)}
          className={stepButtonClassName}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
