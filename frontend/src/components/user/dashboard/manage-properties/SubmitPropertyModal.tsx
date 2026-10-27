"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

type SubmitPropertyModalProps = {
  propertyTitle: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function SubmitPropertyModal({
  propertyTitle,
  isSubmitting,
  onCancel,
  onConfirm,
}: SubmitPropertyModalProps) {
  const headingId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close submit confirmation"
        disabled={isSubmitting}
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Close"
          disabled={isSubmitting}
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <h2 id={headingId} className="pr-8 text-lg font-bold text-slate-900">
          Submit for review?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{propertyTitle}</span> will be sent to Lokesha team for review
          before it can be published.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="min-h-10 cursor-pointer rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="min-h-10 cursor-pointer rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
