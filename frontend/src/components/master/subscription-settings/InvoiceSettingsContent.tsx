"use client";

import { AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import { useToast } from "@/components/shared/ui/ToastProvider";
import type { InvoiceSettings } from "@/services/adminSubscription.service";
import InvoiceSettingsSkeleton from "./InvoiceSettingsSkeleton";
import {
  buildNumberExample,
  buildSettingsUpdate,
  getMissingDetails,
  toFormState,
  validateSettingsForm,
  type SettingsFormErrors,
  type SettingsFormState,
} from "./settingsShared";
import { useInvoiceSettings } from "./useInvoiceSettings";

const textareaClassName =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-base font-bold text-slate-800">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{text}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

// The form starts from the saved values, so it is mounted only once they are loaded
function SettingsForm({ settings, onSave }: { settings: InvoiceSettings; onSave: ReturnType<typeof useInvoiceSettings>["save"] }) {
  const { showToast } = useToast();
  const [form, setForm] = useState<SettingsFormState>(() => toFormState(settings));
  const [errors, setErrors] = useState<SettingsFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = Object.keys(buildSettingsUpdate(settings, form)).length > 0;
  const missing = getMissingDetails(form);

  const change = (field: keyof SettingsFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    const found = validateSettingsForm(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setIsSaving(true);
    const result = await onSave(buildSettingsUpdate(settings, form));
    setIsSaving(false);

    if (result.ok) {
      showToast(result.message, "success");
      return;
    }
    setErrors((result.fields ?? {}) as SettingsFormErrors);
    setSubmitError(result.message);
  };

  return (
    <div className="space-y-6">
      {missing.length ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-900 sm:px-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="text-sm font-bold">Invoice details are incomplete</p>
            <p className="text-sm font-medium opacity-90">
              Still missing: {missing.join(", ")}. An invoice keeps the details it was issued with, so fill these in before the first payment.
            </p>
          </div>
        </div>
      ) : (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-900 sm:px-5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-sm font-bold">Ready to issue invoices</p>
            <p className="text-sm font-medium opacity-90">Changes apply to new invoices only. Issued invoices are never edited.</p>
          </div>
        </div>
      )}

      <Section title="Business details" text="Printed at the top of every invoice and credit note">
        <FloatingInput id="settings-legal-name" label="Legal name" value={form.legalName} onChange={(value) => change("legalName", value)} error={errors.legalName} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FloatingInput id="settings-gstin" label="GSTIN" value={form.gstin} onChange={(value) => change("gstin", value.toUpperCase())} error={errors.gstin} />
          <FloatingInput id="settings-sac" label="SAC code" inputMode="numeric" value={form.sacCode} onChange={(value) => change("sacCode", value)} error={errors.sacCode} />
        </div>
        <div>
          <label htmlFor="settings-address" className="mb-1.5 block text-sm font-medium text-slate-700">
            Registered address
          </label>
          <textarea
            id="settings-address"
            rows={3}
            maxLength={500}
            value={form.address}
            onChange={(event) => change("address", event.target.value)}
            aria-invalid={Boolean(errors.address)}
            className={textareaClassName}
          />
          {errors.address ? (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.address}
            </p>
          ) : null}
        </div>
      </Section>

      <Section title="Numbering" text="Numbers are sequential for each financial year (1 April to 31 March) and never repeat">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FloatingInput id="settings-invoice-prefix" label="Invoice prefix" value={form.invoicePrefix} onChange={(value) => change("invoicePrefix", value.toUpperCase())} error={errors.invoicePrefix} />
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              Example: <span className="font-mono text-slate-700">{buildNumberExample(form.invoicePrefix)}</span>
            </p>
          </div>
          <div>
            <FloatingInput id="settings-credit-prefix" label="Credit note prefix" value={form.creditNotePrefix} onChange={(value) => change("creditNotePrefix", value.toUpperCase())} error={errors.creditNotePrefix} />
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              Example: <span className="font-mono text-slate-700">{buildNumberExample(form.creditNotePrefix)}</span>
            </p>
          </div>
        </div>
      </Section>

      {submitError ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving || !hasChanges}
          onClick={handleSubmit}
          className="bg-linear-to-r-navy-blue inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

export default function InvoiceSettingsContent() {
  const { settings, isLoading, error, reload, save } = useInvoiceSettings();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Invoice Settings</h1>
          <p className="text-sm text-slate-500">The business details and numbering used on every invoice</p>
        </div>
      </header>

      <section className="mt-6 max-w-3xl" aria-live="polite">
        {isLoading ? (
          <InvoiceSettingsSkeleton />
        ) : error || !settings ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : (
          <SettingsForm settings={settings} onSave={save} />
        )}
      </section>
    </div>
  );
}
