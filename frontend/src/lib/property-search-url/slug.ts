// "Navi Mumbai" -> "navi-mumbai", "Triple+" -> "triple-plus"
export function toUrlSegment(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

// "Shyam Swastik" -> "shyam-swastik"
export function slugify(label: string): string {
  return toUrlSegment(label);
}

// "navi-mumbai" -> "navi mumbai"
export function fromUrlSegment(segment: string): string {
  return segment.replace(/-/g, " ").trim();
}

// "navi-mumbai" -> "Navi Mumbai"
export function fromUrlSegmentTitle(segment: string): string {
  return fromUrlSegment(segment).replace(/(^|\s)\p{L}/gu, (match) =>
    match.toUpperCase(),
  );
}
