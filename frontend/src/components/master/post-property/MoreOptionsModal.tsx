"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { postPropertyChipClass } from "./postPropertyForm.styles";

type MoreOptionsModalProps = {
  isOpen: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

export default function MoreOptionsModal({
  isOpen,
  title,
  options,
  selectedValue,
  onClose,
  onSubmit,
}: MoreOptionsModalProps) {
  const [pendingValue, setPendingValue] = useState(selectedValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setPendingValue(selectedValue);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, selectedValue]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label={`Close ${title} modal`}
          className="fixed inset-0 cursor-pointer bg-[#fafcff]/20"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-options-heading"
          className="relative z-10 flex w-full max-w-md max-h-[calc(100dvh-20rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/80"
        >
          <div className="relative shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 sm:right-4 sm:top-4"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="flex items-start gap-3 pr-10">
              <span
                className="mt-1 h-5 w-1 shrink-0 rounded-full bg-sky-500"
                aria-hidden
              />
              <div className="min-w-0">
                <h2
                  id="more-options-heading"
                  className="font-display text-lg font-bold tracking-tight text-slate-800"
                >
                  {title}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Select an option and submit to apply
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="flex flex-wrap justify-center gap-2.5">
              {options.map((option) => {
                const isSelected = pendingValue === option;

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPendingValue(option)}
                    className={`${postPropertyChipClass(isSelected)} min-w-[3rem] px-4 py-2.5 text-sm`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => {
                if (pendingValue) onSubmit(pendingValue);
              }}
              disabled={!pendingValue}
              className="bg-linear-to-r-navy-blue inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
