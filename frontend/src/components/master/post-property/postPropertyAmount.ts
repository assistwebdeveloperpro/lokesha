export function sanitizeAmountRaw(value: string): string {
  const withoutCommas = value.replace(/,/g, "");
  const cleaned = withoutCommas.replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) {
    return cleaned;
  }

  const intPart = cleaned.slice(0, dotIndex);
  const decPart = cleaned.slice(dotIndex + 1).replace(/\./g, "");
  return decPart ? `${intPart}.${decPart}` : intPart;
}

export function formatAmountDisplay(raw: string): string {
  const sanitized = sanitizeAmountRaw(raw);
  if (!sanitized) {
    return "";
  }

  if (sanitized.endsWith(".")) {
    const intPart = sanitized.slice(0, -1);
    if (!intPart) {
      return ".";
    }
    return `${Number(intPart).toLocaleString("en-IN")}.`;
  }

  const [intPart, decPart] = sanitized.split(".");
  const formattedInt = intPart
    ? Number(intPart).toLocaleString("en-IN")
    : "0";

  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }

  return formattedInt;
}

export function parseAmountNumber(value: string): number {
  const sanitized = sanitizeAmountRaw(value);
  if (!sanitized || sanitized === ".") {
    return NaN;
  }
  return Number(sanitized);
}
