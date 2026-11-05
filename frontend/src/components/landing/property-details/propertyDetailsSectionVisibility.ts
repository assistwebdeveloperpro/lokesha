import type { PropertyDetailsDeveloper, PropertyDetailsFaq } from "./propertyDetails.types";

export function hasPropertyDetailsText(value: string): boolean {
  return value.trim().length > 0;
}

export function hasPropertyDetailsAboutSection(description: string, address: string): boolean {
  return hasPropertyDetailsText(description) || hasPropertyDetailsText(address);
}

export function hasPropertyDetailsFaqs(faqs: PropertyDetailsFaq[]): boolean {
  return faqs.length > 0;
}

export function hasPropertyDetailsDeveloperSection(developer: PropertyDetailsDeveloper): boolean {
  if (!hasPropertyDetailsText(developer.name)) return false;

  return (
    developer.totalProjects > 0 ||
    developer.ongoingProjects > 0 ||
    developer.completedProjects > 0 ||
    hasPropertyDetailsText(developer.description)
  );
}
