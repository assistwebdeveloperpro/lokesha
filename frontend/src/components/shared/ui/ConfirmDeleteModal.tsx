"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type ConfirmDeleteModalProps = {
  title: string;
  children: ReactNode;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  title,
  children,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const headingId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        disabled={isDeleting}
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
          disabled={isDeleting}
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <h2 id={headingId} className="pr-8 text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{children}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="min-h-10 cursor-pointer rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="min-h-10 cursor-pointer rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
