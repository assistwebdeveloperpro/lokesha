const LAC = 100_000;
const CRORE = 10_000_000;

const BUDGET_PARAM_PATTERN = /^(\d+(?:\.\d+)?)-(lacs?|lakhs?|crores?|cr)$/i;

const trimNumber = (value: number) => Number(value.toFixed(2)).toString();

// 500000 -> "5-Lacs", 30000000 -> "3-Crores"
export function formatBudgetParam(rupees: number): string {
  if (rupees >= CRORE) return `${trimNumber(rupees / CRORE)}-Crores`;
  if (rupees >= LAC) return `${trimNumber(rupees / LAC)}-Lacs`;
  return String(Math.round(rupees));
}

export function parseBudgetParam(value: string): number | undefined {
  const text = value.trim();
  if (/^\d+$/.test(text)) return Number(text);

  const match = BUDGET_PARAM_PATTERN.exec(text);
  if (!match) return undefined;

  const unit = match[2].toLowerCase().startsWith("c") ? CRORE : LAC;
  return Math.round(Number(match[1]) * unit);
}
