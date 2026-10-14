"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

const inputClassName =
  "w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

type AddWhatsappModalProps = {
  isOpen: boolean;
  mode?: "add" | "update";
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onUpdate: () => void;
  error?: string | null;
  isSaving?: boolean;
};

export default function AddWhatsappModal({
  isOpen,
  mode = "add",
  value,
  onChange,
  onCancel,
  onUpdate,
  error,
  isSaving = false,
}: AddWhatsappModalProps) {
  const isUpdate = mode === "update";
  const title = isUpdate ? "Update Whatsapp No." : "Add Whatsapp No.";
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={`Close ${isUpdate ? "update" : "add"} WhatsApp modal`}
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-whatsapp-heading"
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="pr-8">
          <h2
            id="add-whatsapp-heading"
            className="font-display text-lg font-bold text-slate-900 sm:text-xl"
          >
            {title}
          </h2>
          <p className="profile-description mt-1.5">
            Get NRI leads if you add your whatsapp no.
          </p>
        </div>

        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            onUpdate();
          }}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(9rem,11rem)_1fr] sm:items-center sm:gap-4">
            <label
              htmlFor={inputId}
              className="text-sm font-semibold text-slate-700 sm:text-slate-500"
            >
              Whatsapp Mobile No:
            </label>
            <div className="min-w-0">
              <input
                ref={inputRef}
                id={inputId}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={value}
                onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter mobile number"
                disabled={isSaving}
                className={inputClassName}
              />
              {error ? (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-30"
            >
              {isSaving ? "Updating…" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
