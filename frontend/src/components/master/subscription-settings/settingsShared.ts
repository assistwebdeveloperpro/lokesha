import type { InvoiceSettings, UpdateInvoiceSettingsInput } from "@/services/adminSubscription.service";

export type SettingsFormState = {
  legalName: string;
  address: string;
  gstin: string;
  sacCode: string;
  invoicePrefix: string;
  creditNotePrefix: string;
};

export type SettingsFormErrors = Partial<Record<keyof SettingsFormState, string>>;

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const SAC_PATTERN = /^[0-9]{4,8}$/;
const PREFIX_PATTERN = /^[A-Z0-9-]{1,12}$/;
const EXAMPLE_YEAR = "2026-27";

export const toFormState = (settings: InvoiceSettings): SettingsFormState => ({
  legalName: settings.legalName,
  address: settings.address,
  gstin: settings.gstin,
  sacCode: settings.sacCode,
  invoicePrefix: settings.invoicePrefix,
  creditNotePrefix: settings.creditNotePrefix,
});

// What the server stores: GSTIN and prefixes are upper case and no field keeps stray spaces
export const normalizeForm = (form: SettingsFormState): SettingsFormState => ({
  legalName: form.legalName.trim(),
  address: form.address.trim(),
  gstin: form.gstin.trim().toUpperCase(),
  sacCode: form.sacCode.trim(),
  invoicePrefix: form.invoicePrefix.trim().toUpperCase(),
  creditNotePrefix: form.creditNotePrefix.trim().toUpperCase(),
});

export function validateSettingsForm(form: SettingsFormState): SettingsFormErrors {
  const value = normalizeForm(form);
  const errors: SettingsFormErrors = {};

  if (value.legalName.length > 160) errors.legalName = "Legal name must be 160 characters or fewer";
  if (value.address.length > 500) errors.address = "Address must be 500 characters or fewer";
  if (value.gstin && !GSTIN_PATTERN.test(value.gstin)) errors.gstin = "Enter a valid 15 character GSTIN";
  if (value.sacCode && !SAC_PATTERN.test(value.sacCode)) errors.sacCode = "SAC code must be 4 to 8 digits";
  if (!PREFIX_PATTERN.test(value.invoicePrefix)) errors.invoicePrefix = "Use 1 to 12 letters, numbers or dashes";
  if (!PREFIX_PATTERN.test(value.creditNotePrefix)) errors.creditNotePrefix = "Use 1 to 12 letters, numbers or dashes";

  return errors;
}

// Only the fields that changed are sent
export function buildSettingsUpdate(settings: InvoiceSettings, form: SettingsFormState): UpdateInvoiceSettingsInput {
  const next = normalizeForm(form);
  const current = toFormState(settings);

  return Object.fromEntries(
    (Object.keys(next) as (keyof SettingsFormState)[]).filter((key) => next[key] !== current[key]).map((key) => [key, next[key]]),
  );
}

export const getMissingDetails = (form: SettingsFormState): string[] =>
  (
    [
      ["legalName", "Legal name"],
      ["address", "Address"],
      ["gstin", "GSTIN"],
      ["sacCode", "SAC code"],
    ] as const
  )
    .filter(([key]) => !form[key].trim())
    .map(([, label]) => label);

export const buildNumberExample = (prefix: string, sequence = 1) =>
  `${prefix.trim().toUpperCase() || "—"}/${EXAMPLE_YEAR}/${String(sequence).padStart(6, "0")}`;
