const PAISE_PER_RUPEE = 100;

// Amounts come from the API in paise, so every screen formats them here
export function formatRupees(paise: number): string {
  const rupees = paise / PAISE_PER_RUPEE;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
