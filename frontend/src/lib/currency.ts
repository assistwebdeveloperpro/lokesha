// Amounts are whole rupees end to end, so every screen formats them here
export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
