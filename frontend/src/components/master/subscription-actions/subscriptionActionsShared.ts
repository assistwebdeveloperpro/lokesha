export const MIN_REASON_LENGTH = 5;
export const MAX_REASON_LENGTH = 500;
export const MAX_GIFT_CREDITS = 1000;
export const MAX_ACTION_MONTHS = 60;

export type ActionErrors = Partial<Record<"credits" | "months" | "reason", string>>;

export function validateReason(reason: string): string {
  const length = reason.trim().length;
  if (length === 0) return "Please give a reason for this action";
  if (length < MIN_REASON_LENGTH) return `Reason must be at least ${MIN_REASON_LENGTH} characters`;
  if (length > MAX_REASON_LENGTH) return `Reason must be ${MAX_REASON_LENGTH} characters or fewer`;
  return "";
}

const parseWhole = (text: string) => {
  const value = Number(text.trim());
  return text.trim() !== "" && Number.isInteger(value) ? value : null;
};

function validateWhole(text: string, label: string, max: number): string {
  const value = parseWhole(text);
  return value === null || value < 1 || value > max ? `${label} must be a whole number from 1 to ${max}` : "";
}

const withoutEmpty = (errors: ActionErrors): ActionErrors =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as ActionErrors;

export const validateGift = (form: { credits: string; months: string; reason: string }): ActionErrors =>
  withoutEmpty({
    credits: validateWhole(form.credits, "Credits", MAX_GIFT_CREDITS),
    months: validateWhole(form.months, "Months", MAX_ACTION_MONTHS),
    reason: validateReason(form.reason),
  });

export const validateExtend = (form: { months: string; reason: string }): ActionErrors =>
  withoutEmpty({
    months: validateWhole(form.months, "Months", MAX_ACTION_MONTHS),
    reason: validateReason(form.reason),
  });

export const validateRefund = (form: { reason: string }): ActionErrors => withoutEmpty({ reason: validateReason(form.reason) });

export const toWholeNumber = (text: string) => parseWhole(text) ?? 0;
