import { INDIAN_STATES, type IndianState } from "@/data/indianStatesCities";

export type ReraFormErrors = {
  state?: string;
  reraId?: string;
  validityMonth?: string;
  validityYear?: string;
  verificationLink?: string;
  supportingDocument?: string;
};

export type ReraEntry = {
  id: string;
  state: IndianState;
  reraId: string;
  validityMonth: string;
  validityYear: string;
  verificationLink: string;
  documentFileName: string;
  documentUrl?: string;
};

export const ACCEPTED_RERA_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_RERA_DOCUMENT_EXTENSIONS = ".jpeg,.jpg,.pdf,.doc,.docx";

export const MAX_RERA_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const RERA_ID_MIN_LENGTH = 5;
export const RERA_ID_MAX_LENGTH = 100;

const RERA_ID_GENERAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_-]*[A-Za-z0-9]$|^[A-Za-z0-9]{1,4}$/;

export const MONTH_OPTIONS = [
  { value: "", label: "Month" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return [
    { value: "", label: "Year" },
    ...Array.from({ length: 26 }, (_, index) => {
      const year = String(currentYear + index);
      return { value: year, label: year };
    }),
  ];
}

export function getStateDropdownOptions() {
  return [{ value: "", label: "Select State" }, ...INDIAN_STATES.map((state) => ({
    value: state,
    label: state,
  }))];
}

export function formatValidity(month: string, year: string) {
  const monthLabel = MONTH_OPTIONS.find((option) => option.value === month)?.label;
  if (!monthLabel || !year) return "";
  return `${monthLabel} ${year}`;
}

function isValidityInPast(month: string, year: string) {
  const monthIndex = Number(month) - 1;
  const yearNumber = Number(year);
  if (Number.isNaN(monthIndex) || Number.isNaN(yearNumber)) return false;

  const validityEnd = new Date(yearNumber, monthIndex + 1, 0, 23, 59, 59, 999);
  return validityEnd.getTime() < Date.now();
}

export function validateReraId(reraId: string) {
  const trimmed = reraId.trim();

  if (!trimmed) {
    return "RERA ID is required.";
  }

  if (trimmed.length < RERA_ID_MIN_LENGTH) {
    return `RERA ID must be at least ${RERA_ID_MIN_LENGTH} characters.`;
  }

  if (trimmed.length > RERA_ID_MAX_LENGTH) {
    return `RERA ID must not exceed ${RERA_ID_MAX_LENGTH} characters.`;
  }

  if (/\s/.test(trimmed)) {
    return "RERA ID must not contain spaces.";
  }

  if (!/[A-Za-z]/.test(trimmed)) {
    return "RERA ID must contain at least one letter.";
  }

  if (!/^[A-Za-z0-9/_-]+$/.test(trimmed)) {
    return "RERA ID can only contain letters, numbers, /, -, and _.";
  }

  if (!RERA_ID_GENERAL_PATTERN.test(trimmed)) {
    return "RERA ID must start and end with a letter or number.";
  }

  return undefined;
}

export function validateReraForm(
  values: {
    state: string;
    reraId: string;
    validityMonth: string;
    validityYear: string;
    verificationLink: string;
    supportingDocument?: File | null;
    existingDocumentName?: string;
  },
  existingEntries: ReraEntry[],
  editingId?: string | null,
) {
  const errors: ReraFormErrors = {};

  if (!values.state) {
    errors.state = "State is required.";
  } else if (
    existingEntries.some(
      (entry) => entry.state === values.state && entry.id !== editingId,
    )
  ) {
    errors.state = "RERA details for this state already exist.";
  }

  const reraIdError = validateReraId(values.reraId);
  if (reraIdError) {
    errors.reraId = reraIdError;
  }

  if (!values.validityMonth) {
    errors.validityMonth = "Month is required.";
  }

  if (!values.validityYear) {
    errors.validityYear = "Year is required.";
  }

  if (
    values.validityMonth &&
    values.validityYear &&
    isValidityInPast(values.validityMonth, values.validityYear)
  ) {
    errors.validityYear = "Validity must be a current or future date.";
  }

  if (!values.supportingDocument && !values.existingDocumentName) {
    errors.supportingDocument = "Supporting document is required.";
  } else if (values.supportingDocument) {
    if (!ACCEPTED_RERA_DOCUMENT_TYPES.includes(values.supportingDocument.type as (typeof ACCEPTED_RERA_DOCUMENT_TYPES)[number])) {
      errors.supportingDocument = "Only jpeg, pdf, or doc files are allowed.";
    } else if (values.supportingDocument.size > MAX_RERA_DOCUMENT_SIZE_BYTES) {
      errors.supportingDocument = "File size must not exceed 5 MB.";
    }
  }

  return errors;
}
