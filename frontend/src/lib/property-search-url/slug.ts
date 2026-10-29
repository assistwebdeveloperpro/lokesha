// "Navi Mumbai" -> "Navi-Mumbai", "Triple+" -> "Triple-plus"
export function toUrlSegment(label: string): string {
  return label
    .trim()
    .replace(/\+/g, "-plus")
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

// "Shyam Swastik" -> "shyam-swastik"
export function slugify(label: string): string {
  return toUrlSegment(label).toLowerCase();
}

// "Navi-Mumbai" -> "Navi Mumbai"
export function fromUrlSegment(segment: string): string {
  return segment.replace(/-/g, " ").trim();
}
