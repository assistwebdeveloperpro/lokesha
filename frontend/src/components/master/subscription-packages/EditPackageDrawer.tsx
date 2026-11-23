"use client";

import { AlertTriangle, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import type { SubscriptionPackage } from "@/services/adminSubscription.service";
import type { SavePackageResult } from "./useSubscriptionPackages";
import {
  MAX_BENEFITS,
  STATUS_OPTIONS,
  buildUpdateInput,
  toFormState,
  validatePackageForm,
  type PackageFormErrors,
  type PackageFormState,
} from "./subscriptionPackagesShared";

type EditPackageDrawerProps = {
  pkg: SubscriptionPackage;
  onClose: () => void;
  onSave: (input: ReturnType<typeof buildUpdateInput>) => Promise<SavePackageResult>;
};

type NumberField = { field: keyof PackageFormState; label: string };

const FREE_FIELDS: NumberField[] = [
  { field: "freeCredits", label: "Free listings per user" },
  { field: "freeLeadLimit", label: "Leads per listing" },
  { field: "freePropertyValidityDays", label: "Listing validity (days)" },
];

const LEAD_LIMIT_FIELDS: NumberField[] = [
  { field: "minLeads", label: "Minimum leads per purchase" },
  { field: "maxLeads", label: "Maximum leads per purchase" },
];

const LIMIT_FIELDS: NumberField[] = [
  { field: "minListings", label: "Minimum listings" },
  { field: "maxListings", label: "Maximum listings" },
  { field: "minMonths", label: "Minimum months" },
  { field: "maxMonths", label: "Maximum months" },
];

// The API names the price field differently from the form
const SERVER_FIELD_TO_FORM: Record<string, keyof PackageFormState> = { pricePerListingMonth: "price" };

const textareaClassName =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="font-display text-sm font-bold text-slate-800">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}

export default function EditPackageDrawer({ pkg, onClose, onSave }: EditPackageDrawerProps) {
  const isFree = pkg.code === "free";
  const [form, setForm] = useState<PackageFormState>(() => toFormState(pkg));
  const [errors, setErrors] = useState<PackageFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = useMemo(() => Object.keys(buildUpdateInput(pkg, form)).length > 0, [pkg, form]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, onClose]);

  const setField = <K extends keyof PackageFormState>(key: K, value: PackageFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  };

  const setBenefit = (index: number, value: string) =>
    setField("benefits", form.benefits.map((benefit, position) => (position === index ? value : benefit)));

  const handleSubmit = async () => {
    const found = validatePackageForm(form, pkg.code);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setIsSaving(true);
    const result = await onSave(buildUpdateInput(pkg, form));
    setIsSaving(false);
    if (result.ok) return;

    const serverErrors: PackageFormErrors = {};
    Object.entries(result.fields ?? {}).forEach(([field, message]) => {
      serverErrors[SERVER_FIELD_TO_FORM[field] ?? (field as keyof PackageFormState)] = message;
    });
    setErrors(serverErrors);
    setSubmitError(result.message);
  };

  const renderNumber = ({ field, label }: NumberField) => (
    <FloatingInput
      key={field}
      id={`package-${field}`}
      label={label}
      type="number"
      inputMode="numeric"
      value={String(form[field])}
      onChange={(value) => setField(field, value as never)}
      error={errors[field]}
    />
  );

  const gstInput = (
    <FloatingInput
      id="package-gst"
      label="GST (%)"
      type="number"
      inputMode="decimal"
      value={form.gstPercent}
      onChange={(value) => setField("gstPercent", value)}
      error={errors.gstPercent}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close edit package"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-package-heading"
        className="relative flex h-dvh w-full max-w-xl flex-col bg-slate-50 shadow-2xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-4 py-4 text-white sm:px-6">
          <div className="min-w-0">
            <h2 id="edit-package-heading" className="font-display text-lg font-bold">
              Edit {pkg.name} package
            </h2>
            <p className="text-xs font-medium text-slate-300">Update how this package looks and what it offers</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={isSaving}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
          <Section title="Display details" description="What users see on the package card">
            <FloatingInput
              id="package-name"
              label="Package name"
              value={form.name}
              onChange={(value) => setField("name", value)}
              error={errors.name}
            />
            <FloatingInput
              id="package-display-title"
              label="Display title"
              value={form.displayTitle}
              onChange={(value) => setField("displayTitle", value)}
              error={errors.displayTitle}
            />
            <div>
              <label htmlFor="package-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="package-description"
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                aria-invalid={Boolean(errors.description)}
                className={textareaClassName}
              />
              {errors.description ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Benefit points</span>
                <span className="text-xs text-slate-400">
                  {form.benefits.length}/{MAX_BENEFITS}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {form.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label={`Benefit point ${index + 1}`}
                      maxLength={150}
                      value={benefit}
                      onChange={(event) => setBenefit(index, event.target.value)}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                    <button
                      type="button"
                      aria-label={`Remove benefit point ${index + 1}`}
                      onClick={() => setField("benefits", form.benefits.filter((_, position) => position !== index))}
                      className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              {errors.benefits ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.benefits}
                </p>
              ) : null}
              <button
                type="button"
                disabled={form.benefits.length >= MAX_BENEFITS}
                onClick={() => setField("benefits", [...form.benefits, ""])}
                className="mt-2.5 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add benefit point
              </button>
            </div>

            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4">
              <FloatingInput
                id="package-status"
                label="Status"
                variant="boxed"
                staticLabel
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(value) => setField("status", value as PackageFormState["status"])}
                error={errors.status}
              />
              <div className="min-w-0">
                <label htmlFor="package-displayOrder" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Display order
                </label>
                <input
                  id="package-displayOrder"
                  type="number"
                  inputMode="numeric"
                  value={form.displayOrder}
                  onChange={(event) => setField("displayOrder", event.target.value as never)}
                  aria-invalid={Boolean(errors.displayOrder)}
                  className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                    errors.displayOrder
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200/90 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  }`}
                />
                {errors.displayOrder ? (
                  <p className="mt-1 text-xs text-red-500" role="alert">
                    {errors.displayOrder}
                  </p>
                ) : null}
              </div>
            </div>
            {isFree ? <p className="-mt-2 text-xs text-slate-500">The Free package is given to every new user and cannot be deactivated.</p> : null}
          </Section>

          {isFree ? (
            <Section title="Free package grant" description="Given once to every new user">
              <div className="grid gap-4 sm:grid-cols-2">{FREE_FIELDS.map(renderNumber)}</div>
            </Section>
          ) : pkg.code === "leads" ? (
            <>
              <Section title="Pricing" description="Charged per extra lead, with no duration">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput
                    id="package-price-per-lead"
                    label="Price per lead (₹)"
                    type="number"
                    inputMode="decimal"
                    value={form.pricePerLead}
                    onChange={(value) => setField("pricePerLead", value)}
                    error={errors.pricePerLead}
                  />
                  {gstInput}
                </div>
              </Section>

              <Section title="Purchase limits" description="How many leads a user may buy in one purchase">
                <div className="grid gap-4 sm:grid-cols-2">{LEAD_LIMIT_FIELDS.map(renderNumber)}</div>
              </Section>
            </>
          ) : (
            <>
              <Section title="Pricing" description="Charged per listing, per month">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput
                    id="package-price"
                    label="Price per listing per month (₹)"
                    type="number"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(value) => setField("price", value)}
                    error={errors.price}
                  />
                  {gstInput}
                </div>
              </Section>

              <Section title="Purchase limits" description="What a user may choose when buying">
                <div className="grid gap-4 sm:grid-cols-2">{LIMIT_FIELDS.map(renderNumber)}</div>
                <Toggle
                  id="package-custom-quantity"
                  label="Allow custom number of listings"
                  checked={form.allowCustomQuantity}
                  onChange={(next) => setField("allowCustomQuantity", next)}
                />
                <Toggle
                  id="package-custom-duration"
                  label="Allow custom duration"
                  checked={form.allowCustomDuration}
                  onChange={(next) => setField("allowCustomDuration", next)}
                />
              </Section>
            </>
          )}
        </div>

        <footer className="max-h-[45dvh] space-y-3 overflow-y-auto border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Changes apply to new purchases and new users only. Existing subscriptions and orders keep their original terms.
          </div>
          {submitError ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || !hasChanges}
              onClick={handleSubmit}
              className="bg-linear-to-r-navy-blue inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
