"use client";

import { Loader2, Lock, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import type { PurchaseMessage } from "./useCheckoutRunner";

type PaymentDialogProps = {
  headingId: string;
  title: string;
  subtitle: string;
  closeLabel: string;
  isBusy: boolean;
  payLabel: string;
  isPayDisabled?: boolean;
  gstin: string;
  gstinError: string;
  message: PurchaseMessage | null;
  onGstinChange: (value: string) => void;
  onClose: () => void;
  onPay: () => void;
  children: ReactNode;
};

// The dialog every online purchase shares: details on top, optional GSTIN, then the pay button
export default function PaymentDialog({
  headingId,
  title,
  subtitle,
  closeLabel,
  isBusy,
  payLabel,
  isPayDisabled = false,
  gstin,
  gstinError,
  message,
  onGstinChange,
  onClose,
  onPay,
  children,
}: PaymentDialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={closeLabel}
        disabled={isBusy}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-6">
          <div>
            <h2 id={headingId} className="font-display text-lg font-bold">
              {title}
            </h2>
            <p className="text-xs font-medium text-slate-300">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={isBusy}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {children}

          <div>
            <label htmlFor="purchase-gstin" className="text-sm font-semibold text-slate-700">
              GSTIN <span className="font-medium text-slate-400">(optional, shown on the invoice)</span>
            </label>
            <input
              id="purchase-gstin"
              type="text"
              maxLength={15}
              autoComplete="off"
              placeholder="e.g. 24AAACC1206D1ZM"
              value={gstin}
              disabled={isBusy}
              onChange={(event) => onGstinChange(event.target.value)}
              aria-invalid={Boolean(gstinError)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium uppercase text-slate-900 shadow-sm outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50"
            />
            {gstinError ? (
              <p className="mt-1 text-xs text-red-500" role="alert">
                {gstinError}
              </p>
            ) : null}
          </div>

          {message ? (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ring-1 ${
                message.type === "error" ? "bg-red-50 text-red-700 ring-red-200" : "bg-sky-50 text-sky-800 ring-sky-200"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </div>

        <footer className="space-y-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="min-h-12 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isBusy || isPayDisabled}
              onClick={onPay}
              className="bg-linear-to-r-navy-blue inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              {payLabel}
            </button>
          </div>
          <p className="text-center text-xs font-medium text-slate-400">Secure payment powered by Razorpay</p>
        </footer>
      </div>
    </div>
  );
}
