"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { MAX_REASON_LENGTH } from "./subscriptionActionsShared";

type ActionModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  runningLabel: string;
  tone?: "navy" | "danger";
  isRunning: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
  children: ReactNode;
};

const TONE_CLASSES = {
  navy: "bg-linear-to-r-navy-blue",
  danger: "bg-red-600 hover:bg-red-700",
};

export function ActionModal({
  title,
  description,
  confirmLabel,
  runningLabel,
  tone = "navy",
  isRunning,
  error,
  onClose,
  onConfirm,
  children,
}: ActionModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isRunning) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRunning, onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" disabled={isRunning} onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-heading"
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id="action-modal-heading" className="font-display text-lg font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={isRunning}
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
          {error ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            disabled={isRunning}
            onClick={onClose}
            className="min-h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={onConfirm}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSES[tone]}`}
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {isRunning ? runningLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type ReasonFieldProps = {
  id: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function ReasonField({ id, value, error, disabled, onChange }: ReasonFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        Reason <span className="font-medium text-slate-400">(kept in the audit trail)</span>
      </label>
      <textarea
        id={id}
        rows={3}
        maxLength={MAX_REASON_LENGTH}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50"
      />
      <div className="mt-1 flex justify-between text-xs">
        <span className="text-red-500" role="alert">
          {error}
        </span>
        <span className="text-slate-400">
          {value.length}/{MAX_REASON_LENGTH}
        </span>
      </div>
    </div>
  );
}
