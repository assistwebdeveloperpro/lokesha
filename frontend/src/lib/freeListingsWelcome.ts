import { fetchCreditAvailability } from "@/services/userSubscription.service";

// The count comes from the account, because the admin can change how many free listings a new user gets
export function buildFreeListingsWelcome(available: number): string | null {
  if (available <= 0) return null;

  return `Welcome to Lokesha! You have ${available} free ${available === 1 ? "listing" : "listings"}.`;
}


export async function loadFreeListingsWelcome(token: string): Promise<string | null> {
  try {
    const { available } = await fetchCreditAvailability(token);
    return buildFreeListingsWelcome(available);
  } catch {
    return null;
  }
}
