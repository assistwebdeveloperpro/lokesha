"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

type RejectPropertyModalProps = {
  propertyTitle: string;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

export default function RejectPropertyModal({ propertyTitle, isSaving, onCancel, onConfirm }: RejectPropertyModalProps) {
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = reason.trim();
  const isValid = trimmed.length >= MIN_REASON_LENGTH;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, onCancel]);

  const handleSubmit = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close reject dialog"
        disabled={isSaving}
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-property-heading"
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Close"
          disabled={isSaving}
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <h2 id="reject-property-heading" className="pr-8 text-lg font-bold text-slate-900">
          Reject property?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Tell the owner what to fix in <span className="font-semibold text-slate-800">{propertyTitle}</span>.
        </p>

        <label htmlFor="reject-reason" className="mt-4 block text-sm font-semibold text-slate-800">
          Reason
        </label>
        <textarea
          id="reject-reason"
          ref={inputRef}
          rows={4}
          maxLength={MAX_REASON_LENGTH}
          value={reason}
          disabled={isSaving}
          onChange={(event) => setReason(event.target.value)}
          aria-invalid={showError && !isValid}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-red-500" role="alert">
            {showError && !isValid ? `Please enter at least ${MIN_REASON_LENGTH} characters` : ""}
          </span>
          <span className="text-slate-400">
            {reason.length}/{MAX_REASON_LENGTH}
          </span>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="min-h-10 cursor-pointer rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="min-h-10 cursor-pointer rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
