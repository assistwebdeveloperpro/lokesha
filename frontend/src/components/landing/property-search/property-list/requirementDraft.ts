import type {
  CategorySlug,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";

const DRAFT_KEY = "lokesha_requirement_draft";

export type RequirementDraft = {
  transaction: TransactionSlug;
  category: CategorySlug;
  city: string;
  localities: string[];
  subtypes: string[];
  description: string;
};

type StoredDraft = { href: string; draft: RequirementDraft };

export function saveRequirementDraft(draft: RequirementDraft, href: string) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ href, draft } satisfies StoredDraft));
  } catch {

  }
}

export function loadRequirementDraft(href: string): RequirementDraft | null {
  try {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredDraft;
    return parsed.href === href ? parsed.draft : null;
  } catch {
    return null;
  }
}

export function clearRequirementDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear when storage is blocked
  }
}